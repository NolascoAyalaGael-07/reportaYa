import type { Report, Student } from './screens/reportTypes'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

type ApiResponse<T> = {
  data?: T
  message?: string
}

async function request<T>(path: string, body?: unknown, method?: 'GET' | 'POST' | 'PATCH'): Promise<T> {
  let response: Response

  try {
    response = await fetch(path, {
      method: method ?? (body === undefined ? 'GET' : 'POST'),
      credentials: 'same-origin',
      headers: body === undefined || body instanceof FormData
        ? undefined
        : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    })
  } catch {
    throw new Error('No se pudo conectar con ReportaYa. Verifica que el backend esté ejecutándose.')
  }

  if (response.status === 204) return undefined as T
  const result: unknown = await response.json()
  if (!response.ok) {
    const message = typeof result === 'object'
      && result !== null
      && 'message' in result
      && typeof result.message === 'string'
      ? result.message
      : 'Ocurrió un error. Inténtalo de nuevo.'
    throw new ApiError(message, response.status)
  }
  return result as T
}

type AuthResponse = { student: Student }

export async function login(email: string, password: string): Promise<Student> {
  const result = await request<AuthResponse>('/api/auth/login', { email, password })
  return result.student
}

export async function register(
  name: string,
  controlNumber: string,
  email: string,
  password: string,
): Promise<Student> {
  const result = await request<AuthResponse>('/api/auth/register', { name, controlNumber, email, password })
  return result.student
}

export async function currentStudent(): Promise<Student> {
  const result = await request<AuthResponse>('/api/auth/me')
  return result.student
}

export async function updateProfile(input: {
  name: string
  currentPassword?: string
  newPassword?: string
}): Promise<Student> {
  const result = await request<AuthResponse>('/api/auth/me', input, 'PATCH')
  return result.student
}

export async function listUsers(): Promise<Student[]> {
  const result = await request<{ users: Student[] }>('/api/users')
  return result.users
}

export async function createMaintenanceUser(input: {
  name: string
  controlNumber: string
  email: string
  password: string
}): Promise<Student> {
  const result = await request<{ student: Student }>('/api/users', input)
  return result.student
}

export async function logout(): Promise<void> {
  await request<undefined>('/api/auth/logout', {})
}

export async function listReports(): Promise<Report[]> {
  const result = await request<{ reports: Report[] }>('/api/reports')
  return result.reports
}

export type UserNotification = {
  id: string
  reportId: string
  title: string
  message: string
  createdAt: string
  readAt: string | null
}

export type SupportRequest = {
  id: string
  subject: string
  message: string
  status: 'Abierta' | 'Resuelta'
  createdAt: string
  requesterName: string
  requesterEmail: string
}

export async function listNotifications(): Promise<UserNotification[]> {
  const result = await request<{ notifications: UserNotification[] }>('/api/notifications')
  return result.notifications
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await request<undefined>(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {}, 'PATCH')
}

export async function markAllNotificationsRead(): Promise<void> {
  await request<undefined>('/api/notifications/read-all', {})
}

export async function listSupportRequests(): Promise<SupportRequest[]> {
  const result = await request<{ requests: SupportRequest[] }>('/api/support')
  return result.requests
}

export async function createSupportRequest(subject: string, message: string): Promise<SupportRequest> {
  const result = await request<{ request: SupportRequest }>('/api/support', { subject, message })
  return result.request
}

export async function updateSupportRequestStatus(
  requestId: string,
  status: SupportRequest['status'],
): Promise<void> {
  await request<undefined>(
    `/api/support/${encodeURIComponent(requestId)}/status`,
    { status },
    'PATCH',
  )
}

export type StatusHistoryEntry = {
  id: string
  fromStatus: Report['status'] | null
  toStatus: Report['status']
  changedBy: string
  changedAt: string
  comment: string | null
}

export async function getReport(reportId: string): Promise<Report> {
  const result = await request<{ report: Report }>(`/api/reports/${encodeURIComponent(reportId)}`)
  return result.report
}

export async function getReportHistory(reportId: string): Promise<StatusHistoryEntry[]> {
  const result = await request<{ history: StatusHistoryEntry[] }>(
    `/api/reports/${encodeURIComponent(reportId)}/history`,
  )
  return result.history
}

export async function changeReportStatus(
  reportId: string,
  status: Report['status'],
  comment: string,
): Promise<Report> {
  const result = await request<{ report: Report }>(
    `/api/reports/${encodeURIComponent(reportId)}/status`,
    { status, comment },
    'PATCH',
  )
  return result.report
}

export async function createReport(
  report: Pick<Report, 'category' | 'location' | 'description'>,
  photo?: File | null,
): Promise<Report> {
  const formData = new FormData()
  formData.set('category', report.category)
  formData.set('location', report.location)
  formData.set('description', report.description)
  if (photo) formData.set('photo', photo)
  const result = await request<{ report: Report }>('/api/reports', formData)
  return result.report
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error. Inténtalo de nuevo.'
}
