import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app.js'
import { TestRepository } from './testRepository.js'

const repository = new TestRepository()
const server = createApp(repository).listen(0)
let baseUrl = ''
let adminCookie = ''
let studentCookie = ''
let adminId = ''
let studentId = ''

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

  await register('admin@ejemplo.com', 'A100')
  const adminUser = repository.users.find((user) => user.email === 'admin@ejemplo.com')
  assert.ok(adminUser)
  adminUser.role = 'administrador'
  adminId = adminUser.id
  const adminLogin = await postJson('/api/auth/login', { email: adminUser.email, password: 'clave-segura-123' })
  adminCookie = adminLogin.headers.get('set-cookie')?.split(';')[0] ?? ''

  const studentResponse = await register('student@ejemplo.com', 'S100')
  studentId = String((await studentResponse.json()).student.id)
  const studentLogin = await postJson('/api/auth/login', { email: 'student@ejemplo.com', password: 'clave-segura-123' })
  studentCookie = studentLogin.headers.get('set-cookie')?.split(';')[0] ?? ''
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('solo administradores pueden consultar usuarios y sus datos no exponen hashes', async () => {
  const forbidden = await fetch(`${baseUrl}/api/users`, { headers: { Cookie: studentCookie } })
  assert.equal(forbidden.status, 403)

  const response = await fetch(`${baseUrl}/api/users`, { headers: { Cookie: adminCookie } })
  assert.equal(response.status, 200)
  const users = (await response.json()).users
  assert.equal(users.length, 2)
  assert.equal(users.find((user: { id: string }) => user.id === studentId).role, 'alumno')
  assert.equal('passwordHash' in users[0], false)
})

test('el administrador cambia el rol y nadie puede cambiar su propio rol', async () => {
  const forbidden = await fetch(`${baseUrl}/api/users/${studentId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ role: 'administrador' }),
  })
  assert.equal(forbidden.status, 403)

  const changed = await fetch(`${baseUrl}/api/users/${studentId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ role: 'mantenimiento' }),
  })
  assert.equal(changed.status, 200)
  assert.equal((await changed.json()).student.role, 'mantenimiento')

  const selfDemotion = await fetch(`${baseUrl}/api/users/${adminId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ role: 'alumno' }),
  })
  assert.equal(selfDemotion.status, 409)
})
