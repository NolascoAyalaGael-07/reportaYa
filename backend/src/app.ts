import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import express, { type NextFunction, type Request, type Response } from 'express'
import multer from 'multer'
import { hashPassword, verifyPassword } from './auth.js'
import type { Repository, ReportInput, ReportStatus, Student, SupportRequest, UserRecord, UserRole } from './types.js'

const sessionCookie = 'reportaya_session'
const sessionLifetimeMs = 8 * 60 * 60 * 1000
const allowedCategories = new Set(['Electricidad', 'Plomería', 'Limpieza', 'Mobiliario', 'Otro'])
const reportStatuses = new Set<ReportStatus>(['Pendiente', 'En atención', 'Solucionado'])
type Credentials = {
  name: string
  controlNumber: string
  email: string
  password: string
}

type AppOptions = {
  uploadDirectory?: string
}

class UnsupportedImageError extends Error {}

async function removeUploadedFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath)
  } catch (error) {
    if (!isRecord(error) || error.code !== 'ENOENT') throw error
  }
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

type ProfileUpdate = {
  name: string
  currentPassword?: string
  newPassword?: string
}

function parseProfileUpdate(value: unknown): { data?: ProfileUpdate; error?: string } {
  if (!isRecord(value)) return { error: 'Completa tu nombre.' }
  if ('email' in value || 'controlNumber' in value) {
    return { error: 'El correo y el número de control no se pueden cambiar desde esta pantalla.' }
  }
  if (typeof value.name !== 'string' || value.name.trim().length < 2 || value.name.trim().length > 150) {
    return { error: 'El nombre debe tener entre 2 y 150 caracteres.' }
  }
  if (value.currentPassword !== undefined && typeof value.currentPassword !== 'string') {
    return { error: 'Escribe tu contraseña actual.' }
  }
  if (value.newPassword !== undefined && typeof value.newPassword !== 'string') {
    return { error: 'La nueva contraseña no es válida.' }
  }
  if (value.newPassword !== undefined && (value.newPassword.length < 8 || value.newPassword.length > 128)) {
    return { error: 'La nueva contraseña debe tener entre 8 y 128 caracteres.' }
  }
  if ((value.currentPassword === undefined) !== (value.newPassword === undefined)) {
    return { error: 'Para cambiar la contraseña, completa la actual y la nueva.' }
  }

  return {
    data: {
      name: value.name.trim(),
      ...(typeof value.currentPassword === 'string' ? { currentPassword: value.currentPassword } : {}),
      ...(typeof value.newPassword === 'string' ? { newPassword: value.newPassword } : {}),
    },
  }
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

function parseRole(value: unknown): UserRole | null {
  if (!isRecord(value)) return null
  return value.role === 'alumno' || value.role === 'mantenimiento' || value.role === 'administrador'
    ? value.role
    : null
}

function parseStatus(value: unknown): ReportStatus | null {
  if (!isRecord(value) || typeof value.status !== 'string') return null
  return reportStatuses.has(value.status as ReportStatus) ? value.status as ReportStatus : null
}

function parseReportFilters(query: Request['query']): { data?: { status?: ReportStatus; category?: string; query?: string }; error?: string } {
  const { status, category, q } = query
  if (status !== undefined && (typeof status !== 'string' || !reportStatuses.has(status as ReportStatus))) {
    return { error: 'Selecciona un estado válido.' }
  }
  if (category !== undefined && (typeof category !== 'string' || !allowedCategories.has(category))) {
    return { error: 'Selecciona una categoría válida.' }
  }
  if (q !== undefined && (typeof q !== 'string' || q.trim().length > 100)) {
    return { error: 'La búsqueda no puede superar 100 caracteres.' }
  }
  return {
    data: {
      ...(typeof status === 'string' ? { status: status as ReportStatus } : {}),
      ...(typeof category === 'string' ? { category } : {}),
      ...(typeof q === 'string' && q.trim() ? { query: q.trim() } : {}),
    },
  }
}

function parseSupportRequest(value: unknown): { data?: { subject: string; message: string }; error?: string } {
  if (!isRecord(value) || typeof value.subject !== 'string' || typeof value.message !== 'string') {
    return { error: 'Escribe un asunto y una descripción para tu solicitud.' }
  }
  const subject = value.subject.trim()
  const message = value.message.trim()
  if (subject.length < 4 || subject.length > 120) {
    return { error: 'El asunto debe tener entre 4 y 120 caracteres.' }
  }
  if (message.length < 10 || message.length > 2000) {
    return { error: 'El mensaje debe tener entre 10 y 2000 caracteres.' }
  }
  return { data: { subject, message } }
}

function parseSupportStatus(value: unknown): SupportRequest['status'] | null {
  if (!isRecord(value) || (value.status !== 'Abierta' && value.status !== 'Resuelta')) return null
  return value.status
}

function isDuplicateEntry(error: unknown): boolean {
  return isRecord(error) && error.code === 'ER_DUP_ENTRY'
}

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.cookie?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`))
  return cookie?.slice(sessionCookie.length + 1) || null
}

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
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

export function createApp(repository: Repository, options: AppOptions = {}) {
  const app = express()
  const uploadDirectory = resolve(options.uploadDirectory ?? resolve(process.cwd(), 'uploads'))
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_request, _file, callback) => {
        void mkdir(uploadDirectory, { recursive: true })
          .then(() => callback(null, uploadDirectory))
          .catch((error: Error) => callback(error, uploadDirectory))
      },
      filename: (_request, _file, callback) => callback(null, `${randomUUID()}.upload`),
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_request, file, callback) => {
      if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
        callback(new UnsupportedImageError('Elige una imagen JPG o PNG.'))
        return
      }
      callback(null, true)
    },
  })
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
      await repository.createSession(hashSessionToken(token), student.id, Date.now() + sessionLifetimeMs)
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
    await repository.createSession(hashSessionToken(token), user.id, Date.now() + sessionLifetimeMs)
    setSessionCookie(response, token)
    return response.json({ student: publicStudent(user) })
  })

  app.post('/api/auth/logout', async (request, response) => {
    const token = getSessionToken(request)
    if (token) await repository.deleteSession(hashSessionToken(token))
    clearSessionCookie(response)
    return response.status(204).end()
  })

  const requireSession = async (request: Request, response: Response, next: NextFunction) => {
    const token = getSessionToken(request)
    if (!token) {
      clearSessionCookie(response)
      return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    }

    const tokenHash = hashSessionToken(token)
    const session = await repository.findSession(tokenHash)
    if (!session) {
      clearSessionCookie(response)
      return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    }

    const user = await repository.findUserById(session.userId)
    if (!user) {
      await repository.deleteSession(tokenHash)
      clearSessionCookie(response)
      return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    }

    response.locals.student = publicStudent(user)
    return next()
  }

  app.get('/api/auth/me', requireSession, (_request, response) => {
    return response.json({ student: response.locals.student })
  })

  app.patch('/api/auth/me', requireSession, async (request, response) => {
    const student = response.locals.student
    const parsed = parseProfileUpdate(request.body)
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (!parsed.data) return response.status(400).json({ message: parsed.error })
    const account = await repository.findUserById(student.id)
    if (!account) return response.status(404).json({ message: 'No se encontró la cuenta.' })

    if (parsed.data.newPassword) {
      if (!await verifyPassword(parsed.data.currentPassword ?? '', account.passwordHash)) {
        return response.status(400).json({ message: 'La contraseña actual es incorrecta.' })
      }
    }

    const passwordHash = parsed.data.newPassword
      ? await hashPassword(parsed.data.newPassword)
      : null
    const updatedStudent = await repository.updateAccount(student.id, parsed.data.name, passwordHash)
    if (!updatedStudent) return response.status(404).json({ message: 'No se encontró la cuenta.' })
    return response.json({ student: updatedStudent })
  })

  app.get('/api/users', requireSession, requireRole('administrador'), async (_request, response) => {
    return response.json({ users: await repository.listUsers() })
  })

  app.patch('/api/users/:id/role', requireSession, requireRole('administrador'), async (request, response) => {
    const actor = response.locals.student
    const targetId = request.params.id
    const role = parseRole(request.body)
    if (!actor) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (typeof targetId !== 'string' || !/^[1-9]\d*$/.test(targetId) || !role) {
      return response.status(400).json({ message: 'Selecciona un usuario y un rol válidos.' })
    }

    const result = await repository.updateUserRole(actor.id, targetId, role)
    if ('error' in result) {
      const messages = {
        not_found: 'No se encontró esa cuenta.',
        last_admin: 'No puedes quitar el rol del último administrador.',
        self: 'No puedes cambiar tu propio rol.',
      }
      return response.status(result.error === 'not_found' ? 404 : 409).json({ message: messages[result.error] })
    }
    return response.json({ student: result.student })
  })

  app.get('/api/notifications', requireSession, async (_request, response) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    return response.json({ notifications: await repository.listNotifications(student.id) })
  })

  app.patch('/api/notifications/:id/read', requireSession, async (request, response) => {
    const student = response.locals.student
    const notificationId = request.params.id
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (typeof notificationId !== 'string' || !/^[1-9]\d*$/.test(notificationId)) {
      return response.status(400).json({ message: 'Selecciona una notificación válida.' })
    }
    if (!await repository.markNotificationRead(student.id, notificationId)) {
      return response.status(404).json({ message: 'No se encontró esa notificación.' })
    }
    return response.status(204).end()
  })

  app.post('/api/notifications/read-all', requireSession, async (_request, response) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    await repository.markAllNotificationsRead(student.id)
    return response.status(204).end()
  })

  app.get('/api/support', requireSession, async (_request, response) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    return response.json({ requests: await repository.listSupportRequests(student.id, student.role) })
  })

  app.post('/api/support', requireSession, async (request, response) => {
    const student = response.locals.student
    const parsed = parseSupportRequest(request.body)
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (!parsed.data) return response.status(400).json({ message: parsed.error })
    const supportRequest = await repository.createSupportRequest(student.id, parsed.data.subject, parsed.data.message)
    return response.status(201).json({ request: supportRequest })
  })

  app.patch('/api/support/:id/status', requireSession, requireRole('administrador'), async (request, response) => {
    const requestId = request.params.id
    const status = parseSupportStatus(request.body)
    if (typeof requestId !== 'string' || !/^[1-9]\d*$/.test(requestId) || !status) {
      return response.status(400).json({ message: 'Selecciona una solicitud y un estado válidos.' })
    }
    if (!await repository.updateSupportRequestStatus(requestId, status)) {
      return response.status(404).json({ message: 'No se encontró esa solicitud.' })
    }
    return response.status(204).end()
  })

  app.get('/api/reports', requireSession, async (_request, response) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    const filters = parseReportFilters(_request.query)
    if (!filters.data) return response.status(400).json({ message: filters.error })
    const reports = await repository.listReports(student.id, student.role, filters.data)
    return response.json({ reports })
  })

  app.get('/api/reports/:id', requireSession, async (request, response) => {
    const student = response.locals.student
    const reportId = request.params.id
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (typeof reportId !== 'string' || !/^[1-9]\d*$/.test(reportId)) {
      return response.status(400).json({ message: 'Selecciona un reporte válido.' })
    }

    const report = await repository.getReport(student.id, student.role, reportId)
    if (!report) return response.status(404).json({ message: 'No se encontró ese reporte.' })
    return response.json({ report })
  })

  app.get('/api/reports/:id/history', requireSession, async (request, response) => {
    const student = response.locals.student
    const reportId = request.params.id
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (typeof reportId !== 'string' || !/^[1-9]\d*$/.test(reportId)) {
      return response.status(400).json({ message: 'Selecciona un reporte válido.' })
    }

    const report = await repository.getReport(student.id, student.role, reportId)
    if (!report) return response.status(404).json({ message: 'No se encontró ese reporte.' })
    return response.json({ history: await repository.listStatusHistory(student.id, student.role, reportId) })
  })

  app.get('/api/reports/:id/photo', requireSession, async (request, response) => {
    const student = response.locals.student
    const reportId = request.params.id
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (typeof reportId !== 'string' || !/^[1-9]\d*$/.test(reportId)) {
      return response.status(400).json({ message: 'Selecciona un reporte válido.' })
    }

    const photoPath = await repository.getReportPhotoPath(student.id, student.role, reportId)
    if (!photoPath) return response.status(404).json({ message: 'No se encontró una fotografía para ese reporte.' })
    const fileName = basename(photoPath)
    if (fileName !== photoPath || !/\.(jpg|png)$/.test(fileName)) {
      throw new Error('El reporte tiene una ruta de fotografía inválida.')
    }

    const filePath = resolve(uploadDirectory, fileName)
    let image: Buffer
    try {
      image = await readFile(filePath)
    } catch (error) {
      if (isRecord(error) && error.code === 'ENOENT') {
        return response.status(404).json({ message: 'La fotografía de este reporte ya no está disponible.' })
      }
      throw error
    }
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.type(fileName.endsWith('.png') ? 'image/png' : 'image/jpeg')
    return response.send(image)
  })

  app.post('/api/reports', requireSession, requireRole('alumno'), upload.single('photo'), async (request, response) => {
    const student = response.locals.student
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    const parsed = parseReport(request.body)
    if (!parsed.data) {
      if (request.file) await removeUploadedFile(request.file.path)
      return response.status(400).json({ message: parsed.error })
    }

    let photoPath: string | null = null
    let fileToClean = request.file?.path
    if (request.file) {
      try {
        const contents = await readFile(request.file.path)
        const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        const jpegSignature = Buffer.from([0xff, 0xd8, 0xff])
        const extension = contents.subarray(0, pngSignature.length).equals(pngSignature)
          ? 'png'
          : contents.subarray(0, jpegSignature.length).equals(jpegSignature)
            ? 'jpg'
            : null
        if (!extension) {
          await removeUploadedFile(request.file.path)
          return response.status(400).json({ message: 'El archivo no contiene una imagen JPG o PNG válida.' })
        }

        photoPath = `${randomUUID()}.${extension}`
        const storedImagePath = resolve(uploadDirectory, photoPath)
        await rename(request.file.path, storedImagePath)
        fileToClean = storedImagePath
      } catch (error) {
        if (fileToClean) {
          try {
            await removeUploadedFile(fileToClean)
          } catch (cleanupError) {
            console.error('Error al limpiar una imagen inválida:', cleanupError)
          }
        }
        throw error
      }
    }

    try {
      const report = await repository.createReport(student.id, parsed.data, photoPath)
      fileToClean = undefined
      return response.status(201).json({ report })
    } catch (error) {
      if (fileToClean) {
        try {
          await removeUploadedFile(fileToClean)
        } catch (cleanupError) {
          if (!isRecord(cleanupError) || cleanupError.code !== 'ENOENT') {
            console.error('Error al limpiar una imagen de reporte fallida:', cleanupError)
          }
        }
      }
      throw error
    }
  })

  app.patch('/api/reports/:id/status', requireSession, requireRole('mantenimiento', 'administrador'), async (request, response) => {
    const student = response.locals.student
    const reportId = request.params.id
    const status = parseStatus(request.body)
    const comment = isRecord(request.body) && typeof request.body.comment === 'string'
      ? request.body.comment.trim()
      : ''
    if (!student) return response.status(401).json({ message: 'Inicia sesión para continuar.' })
    if (typeof reportId !== 'string' || !/^[1-9]\d*$/.test(reportId) || !status) {
      return response.status(400).json({ message: 'Selecciona un reporte y estado válidos.' })
    }
    if (comment.length > 300) return response.status(400).json({ message: 'El comentario no puede superar 300 caracteres.' })

    const result = await repository.updateReportStatus(student.id, reportId, status, comment || null)
    if ('error' in result) {
      const message = result.error === 'not_found'
        ? 'No se encontró ese reporte.'
        : 'El reporte ya tiene ese estado.'
      return response.status(result.error === 'not_found' ? 404 : 409).json({ message })
    }
    return response.json({ report: result.report })
  })

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return response.status(413).json({ message: 'La imagen debe pesar 5 MB o menos.' })
    }
    if (error instanceof UnsupportedImageError) {
      return response.status(400).json({ message: error.message })
    }
    console.error('Error en ReportaYa API:', error)
    if (response.headersSent) return
    return response.status(500).json({ message: 'Ocurrió un error inesperado. Inténtalo de nuevo.' })
  })

  return app
}
