import { randomBytes } from 'node:crypto'
import express, { type NextFunction, type Request, type Response } from 'express'
import { hashPassword, verifyPassword } from './auth.js'
import type { Repository, ReportInput, ReportStatus, Student, UserRecord, UserRole } from './types.js'

const sessionCookie = 'reportaya_session'
const sessionLifetimeMs = 8 * 60 * 60 * 1000
const allowedCategories = new Set(['Electricidad', 'Plomería', 'Limpieza', 'Mobiliario', 'Otro'])
type Session = {
  student: Student
  expiresAt: number
}

type Credentials = {
  name: string
  controlNumber: string
  email: string
  password: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseCredentials(value: unknown): { data?: Credentials; error?: string } {
  if (!isRecord(value)) return { error: 'Completa los datos de tu cuenta.' }

  const { name, controlNumber, email, password } = value
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 150) {
    return { error: 'Escribe un nombre de entre 2 y 150 caracteres.' }
  }
  if (typeof controlNumber !== 'string' || controlNumber.trim().length < 2 || controlNumber.trim().length > 30) {
    return { error: 'Escribe un número de control válido.' }
  }
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { error: 'Escribe un correo electrónico válido.' }
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return { error: 'La contraseña debe tener entre 8 y 128 caracteres.' }
  }

  return {
    data: {
      name: name.trim(),
      controlNumber: controlNumber.trim(),
      email: email.trim().toLowerCase(),
      password,
    },
  }
}

function parseLogin(value: unknown): { email: string; password: string } | null {
  if (!isRecord(value) || typeof value.email !== 'string' || typeof value.password !== 'string') return null
  const email = value.email.trim().toLowerCase()

  if (email.length > 254 || value.password.length < 1 || value.password.length > 128) return null
  return { email, password: value.password }
}

function parseReport(value: unknown): { data?: ReportInput; error?: string } {
  if (!isRecord(value)) return { error: 'Completa los datos del reporte.' }

  const { category, location, description } = value
  if (typeof category !== 'string' || !allowedCategories.has(category)) {
    return { error: 'Selecciona una categoría válida.' }
  }
  if (typeof location !== 'string' || location.trim().length < 2 || location.trim().length > 200) {
    return { error: 'Escribe una ubicación de entre 2 y 200 caracteres.' }
  }
  if (typeof description !== 'string' || description.trim().length < 5 || description.trim().length > 500) {
    return { error: 'La descripción debe tener entre 5 y 500 caracteres.' }
  }

  const cleanDescription = description.trim()
  return {
    data: {
      title: cleanDescription.length > 40 ? `${cleanDescription.slice(0, 37)}…` : cleanDescription,
      category,
      location: location.trim(),
      description: cleanDescription,
      status: 'Pendiente',
    },
  }
}

function isDuplicateEntry(error: unknown): boolean {
  return isRecord(error) && error.code === 'ER_DUP_ENTRY'
}

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.cookie?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`))
  return cookie?.slice(sessionCookie.length + 1) || null
}

function setSessionCookie(response: Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `${sessionCookie}=${token}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=${sessionLifetimeMs / 1000}${secure}`,
  )
}

function clearSessionCookie(response: Response): void {
  response.setHeader('Set-Cookie', `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0`)
}

function publicStudent(user: UserRecord): Student {
  const { passwordHash: _passwordHash, ...student } = user
  return student
}

function requireRole(...roles: UserRole[]) {
  return (_request: Request, response: Response, next: NextFunction) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (!roles.includes(student.role)) {
      return response.status(403).json({ message: 'No tienes permiso para realizar esta acción.' })
    }
    return next()
  }
}

export function createApp(repository: Repository) {
  const app = express()
  const sessions = new Map<string, Session>()
  app.use(express.json({ limit: '16kb' }))

  app.post('/api/auth/register', async (request, response) => {
    const parsed = parseCredentials(request.body)
    if (!parsed.data) return response.status(400).json({ message: parsed.error })
    const { data } = parsed

    if (await repository.findUserByEmail(data.email)) {
      return response.status(409).json({ message: 'Ya existe una cuenta con ese correo.' })
    }

    try {
      const student = await repository.createUser({
        name: data.name,
        controlNumber: data.controlNumber,
        email: data.email,
        passwordHash: await hashPassword(data.password),
      })
      const token = randomBytes(32).toString('base64url')
      sessions.set(token, { student, expiresAt: Date.now() + sessionLifetimeMs })
      setSessionCookie(response, token)
      return response.status(201).json({ student })
    } catch (error) {
      if (isDuplicateEntry(error)) {
        return response.status(409).json({ message: 'El correo o número de control ya está registrado.' })
      }
      throw error
    }
  })

  app.post('/api/auth/login', async (request, response) => {
    const credentials = parseLogin(request.body)
    if (!credentials) return response.status(400).json({ message: 'Escribe tu correo y contraseña.' })
    const user = await repository.findUserByEmail(credentials.email)

    if (!await verifyPassword(credentials.password, user?.passwordHash ?? null) || !user) {
      return response.status(401).json({ message: 'Correo o contraseña incorrectos.' })
    }

    const token = randomBytes(32).toString('base64url')
    sessions.set(token, { student: publicStudent(user), expiresAt: Date.now() + sessionLifetimeMs })
    setSessionCookie(response, token)
    return response.json({ student: publicStudent(user) })
  })

  app.post('/api/auth/logout', (request, response) => {
    const token = getSessionToken(request)
    if (token) sessions.delete(token)
    clearSessionCookie(response)
    return response.status(204).end()
  })

  const requireSession = (request: Request, response: Response, next: NextFunction) => {
    const token = getSessionToken(request)
    const session = token ? sessions.get(token) : undefined
    if (!session || session.expiresAt <= Date.now()) {
      if (token) sessions.delete(token)
      clearSessionCookie(response)
      return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    }

    response.locals.student = session.student
    return next()
  }

  app.get('/api/auth/me', requireSession, (_request, response) => {
    return response.json({ student: response.locals.student })
  })

  app.get('/api/reports', requireSession, async (_request, response) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    const reports = await repository.listReports(student.id)
    return response.json({ reports })
  })

  app.post('/api/reports', requireSession, requireRole('alumno'), async (request, response) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    const parsed = parseReport(request.body)
    if (!parsed.data) return response.status(400).json({ message: parsed.error })
    const report = await repository.createReport(student.id, parsed.data)
    return response.status(201).json({ report })
  })

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    console.error('Error en ReportaYa API:', error)
    if (response.headersSent) return
    return response.status(500).json({ message: 'Ocurrió un error inesperado. Inténtalo de nuevo.' })
  })

  return app
}
