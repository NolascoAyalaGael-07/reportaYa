import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app.js'
import { TestRepository } from './testRepository.js'

const repository = new TestRepository()
const server = createApp(repository).listen(0)
let baseUrl = ''

before(async () => {
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('registro valida los campos requeridos', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mal' }),
  })

  assert.equal(response.status, 400)
  assert.match((await response.json()).message, /nombre/)
})

test('registro guarda un hash, inicia sesión y protege la sesión con cookie HttpOnly', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Andrea Martínez',
      controlNumber: '23210000',
      email: 'Andrea@ejemplo.com',
      password: 'clave-segura-123',
    }),
  })

  assert.equal(response.status, 201)
  assert.match(response.headers.get('set-cookie') ?? '', /HttpOnly/)
  const registered = await response.json()
  assert.equal(registered.student.email, 'andrea@ejemplo.com')
  assert.equal(registered.student.role, 'alumno')
  assert.equal('passwordHash' in registered.student, false)
  assert.notEqual(repository.users[0].passwordHash, 'clave-segura-123')
  assert.match(repository.users[0].passwordHash, /^[\da-f]{32}:[\da-f]{128}$/)
})

test('rechaza correo duplicado y credenciales incorrectas sin revelar cuál falló', async () => {
  const duplicate = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Andrea Martínez',
      controlNumber: '23210001',
      email: 'andrea@ejemplo.com',
      password: 'clave-segura-123',
    }),
  })
  assert.equal(duplicate.status, 409)

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'andrea@ejemplo.com', password: 'clave-incorrecta' }),
  })
  assert.equal(response.status, 401)
  assert.equal((await response.json()).message, 'Correo o contraseña incorrectos.')
})

test('el inicio de sesión acepta la contraseña correcta y el endpoint de sesión la restaura', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ANDREA@ejemplo.com', password: 'clave-segura-123' }),
  })
  assert.equal(response.status, 200)

  const cookie = response.headers.get('set-cookie')?.split(';')[0]
  assert.ok(cookie)
  const currentUser = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } })
  assert.equal(currentUser.status, 200)
  assert.equal((await currentUser.json()).student.email, 'andrea@ejemplo.com')

  const logout = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie },
  })
  assert.equal(logout.status, 204)
  const invalidatedSession = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } })
  assert.equal(invalidatedSession.status, 401)
})
