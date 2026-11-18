import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readdir, rm } from 'node:fs/promises'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createApp } from '../app.js'
import { TestRepository } from './testRepository.js'

const repository = new TestRepository()
const uploadDirectory = join(tmpdir(), `reportaya-tests-${randomUUID()}`)
const server = createApp(repository, { uploadDirectory }).listen(0)
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
  await rm(uploadDirectory, { recursive: true, force: true })
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

test('almacena imágenes validadas, las sirve solo a usuarios autorizados y limpia archivos inválidos', async () => {
  const form = new FormData()
  form.set('category', 'Electricidad')
  form.set('location', 'Edificio B, salón 205')
  form.set('description', 'Una lámpara se fundió esta mañana.')
  const png = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  ])
  form.set('photo', new Blob([png], { type: 'image/png' }), 'lamp.png')

  const created = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: form,
  })
  assert.equal(created.status, 201)
  const report = (await created.json()).report
  assert.equal(report.photoUrl, `/api/reports/${report.id}/photo`)

  const image = await fetch(`${baseUrl}${report.photoUrl}`, { headers: { Cookie: cookie } })
  assert.equal(image.status, 200)
  assert.match(image.headers.get('content-type') ?? '', /image\/png/)
  assert.equal(image.headers.get('x-content-type-options'), 'nosniff')
  assert.equal((await image.arrayBuffer()).byteLength, png.length)

  const privateImage = await fetch(`${baseUrl}${report.photoUrl}`, { headers: { Cookie: otherStudentCookie } })
  assert.equal(privateImage.status, 404)

  const invalidMime = new FormData()
  invalidMime.set('category', 'Electricidad')
  invalidMime.set('location', 'Edificio B')
  invalidMime.set('description', 'La lámpara no funciona.')
  invalidMime.set('photo', new Blob([new Uint8Array([1, 2, 3])], { type: 'text/plain' }), 'bad.txt')
  const rejectedMime = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: invalidMime,
  })
  assert.equal(rejectedMime.status, 400)

  const invalidImage = new FormData()
  invalidImage.set('category', 'Electricidad')
  invalidImage.set('location', 'Edificio B')
  invalidImage.set('description', 'La lámpara no funciona.')
  invalidImage.set('photo', new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }), 'bad.png')
  const rejectedImage = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: invalidImage,
  })
  assert.equal(rejectedImage.status, 400)
  assert.equal((await readdir(uploadDirectory)).length, 1)

  const invalidReport = new FormData()
  invalidReport.set('category', 'Electricidad')
  invalidReport.set('location', '')
  invalidReport.set('description', 'Descripción válida para probar limpieza.')
  invalidReport.set('photo', new Blob([png], { type: 'image/png' }), 'lamp.png')
  const rejectedReport = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: invalidReport,
  })
  assert.equal(rejectedReport.status, 400)
  assert.equal((await readdir(uploadDirectory)).length, 1)
})

test('rechaza imágenes mayores de 5 MB', async () => {
  const form = new FormData()
  form.set('category', 'Electricidad')
  form.set('location', 'Edificio B')
  form.set('description', 'La lámpara no funciona.')
  form.set('photo', new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png')

  const response = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: form,
  })
  assert.equal(response.status, 413)
  assert.equal((await readdir(uploadDirectory)).length, 1)
})

test('rechaza categoría desconocida y evita crear un reporte inválido', async () => {
  const reportCount = repository.reports.length
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
  assert.equal(repository.reports.length, reportCount)
})
