import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app.js'
import { TestRepository } from './testRepository.js'

const repository = new TestRepository()
const server = createApp(repository).listen(0)
let baseUrl = ''
let studentCookie = ''
let otherStudentCookie = ''
let adminCookie = ''

async function postJson(path: string, body: unknown, cookie?: string) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  })
}

async function register(email: string, controlNumber: string) {
  return postJson('/api/auth/register', {
    name: 'ReportaYa User',
    controlNumber,
    email,
    password: 'clave-segura-123',
  })
}

before(async () => {
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`

  const student = await register('alerts@ejemplo.com', 'A100')
  studentCookie = student.headers.get('set-cookie')?.split(';')[0] ?? ''
  const reportResponse = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({
      category: 'Electricidad',
      location: 'Edificio B',
      description: 'Una lámpara dejó de funcionar.',
    }),
  })
  assert.equal(reportResponse.status, 201)

  await register('other@ejemplo.com', 'A200')
  const otherLogin = await postJson('/api/auth/login', { email: 'other@ejemplo.com', password: 'clave-segura-123' })
  otherStudentCookie = otherLogin.headers.get('set-cookie')?.split(';')[0] ?? ''

  await register('admin@ejemplo.com', 'ADM100')
  const adminUser = repository.users.find((user) => user.email === 'admin@ejemplo.com')
  assert.ok(adminUser)
  adminUser.role = 'administrador'
  const adminLogin = await postJson('/api/auth/login', { email: adminUser.email, password: 'clave-segura-123' })
  adminCookie = adminLogin.headers.get('set-cookie')?.split(';')[0] ?? ''
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('avisa al alumno cuando cambia el estado y limita lectura a su propia cuenta', async () => {
  const [report] = repository.reports
  assert.ok(report)

  const update = await fetch(`${baseUrl}/api/reports/${report.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ status: 'En atención', comment: 'Trabajo iniciado.' }),
  })
  assert.equal(update.status, 200)

  const response = await fetch(`${baseUrl}/api/notifications`, { headers: { Cookie: studentCookie } })
  assert.equal(response.status, 200)
  const notifications = (await response.json()).notifications
  assert.equal(notifications.length, 1)
  assert.match(notifications[0].message, /En atención/)

  const forbidden = await fetch(`${baseUrl}/api/notifications/${notifications[0].id}/read`, {
    method: 'PATCH',
    headers: { Cookie: otherStudentCookie },
  })
  assert.equal(forbidden.status, 404)

  const markRead = await fetch(`${baseUrl}/api/notifications/${notifications[0].id}/read`, {
    method: 'PATCH',
    headers: { Cookie: studentCookie },
  })
  assert.equal(markRead.status, 204)
  const updatedList = await fetch(`${baseUrl}/api/notifications`, { headers: { Cookie: studentCookie } })
  assert.ok((await updatedList.json()).notifications[0].readAt)
})

test('crea solicitudes de soporte privadas y permite al administrador resolverlas', async () => {
  const created = await postJson('/api/support', {
    subject: 'Ayuda con mi reporte',
    message: 'No puedo ver el cambio de estado en la lista.',
  }, studentCookie)
  assert.equal(created.status, 201)
  const supportRequest = (await created.json()).request

  const otherRequests = await fetch(`${baseUrl}/api/support`, { headers: { Cookie: otherStudentCookie } })
  assert.equal((await otherRequests.json()).requests.length, 0)

  const adminRequests = await fetch(`${baseUrl}/api/support`, { headers: { Cookie: adminCookie } })
  assert.equal((await adminRequests.json()).requests.length, 1)

  const resolved = await fetch(`${baseUrl}/api/support/${supportRequest.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ status: 'Resuelta' }),
  })
  assert.equal(resolved.status, 204)

  const studentRequests = await fetch(`${baseUrl}/api/support`, { headers: { Cookie: studentCookie } })
  assert.equal((await studentRequests.json()).requests[0].status, 'Resuelta')
})
