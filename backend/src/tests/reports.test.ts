import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app.js'
import { TestRepository } from './testRepository.js'

const repository = new TestRepository()
const server = createApp(repository).listen(0)
let baseUrl = ''
let cookie = ''
let maintenanceCookie = ''
let otherStudentCookie = ''

before(async () => {
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`

  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Andrea Martínez',
      controlNumber: '23210000',
      email: 'reportes@ejemplo.com',
      password: 'clave-segura-123',
    }),
  })
  cookie = response.headers.get('set-cookie')?.split(';')[0] ?? ''

  const maintenanceRegistration = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mario Mantenimiento',
      controlNumber: 'M100',
      email: 'mantenimiento@ejemplo.com',
      password: 'clave-segura-123',
    }),
  })
  const maintenanceUser = repository.users.find((user) => user.email === 'mantenimiento@ejemplo.com')
  assert.ok(maintenanceUser)
  maintenanceUser.role = 'mantenimiento'
  const maintenanceLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: maintenanceUser.email, password: 'clave-segura-123' }),
  })
  maintenanceCookie = maintenanceLogin.headers.get('set-cookie')?.split(';')[0] ?? ''

  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Other Student',
      controlNumber: 'S200',
      email: 'other-student@ejemplo.com',
      password: 'clave-segura-123',
    }),
  })
  const otherStudentLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'other-student@ejemplo.com', password: 'clave-segura-123' }),
  })
  otherStudentCookie = otherStudentLogin.headers.get('set-cookie')?.split(';')[0] ?? ''
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('no permite consultar ni crear reportes sin iniciar sesión', async () => {
  const response = await fetch(`${baseUrl}/api/reports`)
  assert.equal(response.status, 401)
})

test('impide que un usuario de mantenimiento cree reportes como alumno', async () => {
  const user = repository.users.find((candidate) => candidate.email === 'reportes@ejemplo.com')
  assert.ok(user)
  user.role = 'mantenimiento'

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: 'clave-segura-123' }),
  })
  const maintenanceCookie = login.headers.get('set-cookie')?.split(';')[0]
  assert.ok(maintenanceCookie)

  const response = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: maintenanceCookie },
    body: JSON.stringify({
      category: 'Electricidad',
      location: 'Edificio B',
      description: 'Una lámpara está fundida.',
    }),
  })
  assert.equal(response.status, 403)
})

test('crea y consulta reportes persistidos para la sesión', async () => {
  const created = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      category: 'Electricidad',
      location: 'Edificio B, salón 204',
      description: 'La lámpara no enciende desde esta mañana.',
      status: 'Solucionado',
    }),
  })

  assert.equal(created.status, 201)
  const report = (await created.json()).report
  assert.equal(report.status, 'Pendiente')
  assert.ok(report.title.endsWith('…'))
  assert.equal(report.reporterName, 'Andrea Martínez')

  const list = await fetch(`${baseUrl}/api/reports`, { headers: { Cookie: cookie } })
  assert.equal(list.status, 200)
  const reports = (await list.json()).reports
  assert.equal(reports.length, 1)
  assert.equal(reports[0].id, report.id)

  const historyResponse = await fetch(`${baseUrl}/api/reports/${report.id}/history`, { headers: { Cookie: cookie } })
  const initialHistory = (await historyResponse.json()).history
  assert.equal(initialHistory.length, 1)
  assert.equal(initialHistory[0].fromStatus, null)
  assert.equal(initialHistory[0].toStatus, 'Pendiente')
})

test('mantiene detalles privados del reporte y permite a mantenimiento actualizar el estado con historial', async () => {
  const [report] = repository.reports
  assert.ok(report)

  const privateDetail = await fetch(`${baseUrl}/api/reports/${report.id}`, { headers: { Cookie: otherStudentCookie } })
  assert.equal(privateDetail.status, 404)

  const studentUpdate = await fetch(`${baseUrl}/api/reports/${report.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ status: 'En atención' }),
  })
  assert.equal(studentUpdate.status, 403)

  const update = await fetch(`${baseUrl}/api/reports/${report.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: maintenanceCookie },
    body: JSON.stringify({ status: 'En atención', comment: 'Trabajo iniciado.' }),
  })
  assert.equal(update.status, 200)
  assert.equal((await update.json()).report.status, 'En atención')

  const historyResponse = await fetch(`${baseUrl}/api/reports/${report.id}/history`, { headers: { Cookie: cookie } })
  const history = (await historyResponse.json()).history
  assert.equal(history.length, 2)
  assert.equal(history[1].fromStatus, 'Pendiente')
  assert.equal(history[1].toStatus, 'En atención')
  assert.equal(history[1].changedBy, 'Mario Mantenimiento')
  assert.equal(history[1].comment, 'Trabajo iniciado.')
})

test('filtra los reportes por estado y búsqueda para mantenimiento', async () => {
  const filtered = await fetch(`${baseUrl}/api/reports?status=En%20atenci%C3%B3n&q=204`, {
    headers: { Cookie: maintenanceCookie },
  })
  assert.equal(filtered.status, 200)
  const reports = (await filtered.json()).reports
  assert.equal(reports.length, 1)
  assert.equal(reports[0].status, 'En atención')
})

test('rechaza categoría desconocida y evita crear un reporte inválido', async () => {
  const response = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      category: 'Desconocida',
      location: 'Edificio B',
      description: 'Descripción suficientemente larga.',
    }),
  })

  assert.equal(response.status, 400)
  assert.equal((await response.json()).message, 'Selecciona una categoría válida.')
  assert.equal(repository.reports.length, 1)
})
