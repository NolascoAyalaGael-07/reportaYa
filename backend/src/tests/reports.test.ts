import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app.js'
import { TestRepository } from './testRepository.js'

const repository = new TestRepository()
const server = createApp(repository).listen(0)
let baseUrl = ''
let cookie = ''

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
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('no permite consultar ni crear reportes sin iniciar sesión', async () => {
  const response = await fetch(`${baseUrl}/api/reports`)
  assert.equal(response.status, 401)
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

  const list = await fetch(`${baseUrl}/api/reports`, { headers: { Cookie: cookie } })
  assert.equal(list.status, 200)
  const reports = (await list.json()).reports
  assert.equal(reports.length, 1)
  assert.equal(reports[0].id, report.id)
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
