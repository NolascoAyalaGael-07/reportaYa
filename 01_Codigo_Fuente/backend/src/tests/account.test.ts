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
      email: 'account@ejemplo.com',
      password: 'clave-anterior-123',
    }),
  })
  cookie = response.headers.get('set-cookie')?.split(';')[0] ?? ''
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

async function update(body: unknown) {
  return fetch(`${baseUrl}/api/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  })
}

test('actualiza nombre y contraseña sin cambiar correo ni número de control', async () => {
  const response = await update({
    name: 'Andrea Martínez López',
    currentPassword: 'clave-anterior-123',
    newPassword: 'clave-nueva-456',
  })
  assert.equal(response.status, 200)
  const student = (await response.json()).student
  assert.equal(student.name, 'Andrea Martínez López')
  assert.equal(student.email, 'account@ejemplo.com')
  assert.equal(student.controlNumber, '23210000')
  assert.equal(repository.users[0].passwordHash.startsWith('clave-nueva-456'), false)

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: student.email, password: 'clave-nueva-456' }),
  })
  assert.equal(login.status, 200)
})

test('rechaza contraseña actual incorrecta e intentos de cambiar datos inmutables', async () => {
  const wrongPassword = await update({
    name: 'Andrea Martínez López',
    currentPassword: 'incorrecta',
    newPassword: 'otra-clave-123',
  })
  assert.equal(wrongPassword.status, 400)
  assert.equal((await wrongPassword.json()).message, 'La contraseña actual es incorrecta.')

  const emailChange = await update({ name: 'Andrea Martínez López', email: 'otro@ejemplo.com' })
  assert.equal(emailChange.status, 400)
  assert.match((await emailChange.json()).message, /no se pueden cambiar/)
})
