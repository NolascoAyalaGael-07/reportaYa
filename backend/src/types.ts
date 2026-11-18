export type UserRole = 'alumno' | 'mantenimiento' | 'administrador'

export type Student = {
  id: string
  name: string
  controlNumber: string
  email: string
  role: UserRole
}

export type UserRecord = Student & {
  passwordHash: string
}

export type ReportStatus = 'Pendiente' | 'En atención' | 'Solucionado'

export type ReportInput = {
  title: string
  category: string
  location: string
  description: string
  status: ReportStatus
}

export type ReportRecord = ReportInput & {
  id: string
  date: string
  reporterName: string
  reporterControlNumber: string
  photoUrl: string | null
}

export type ReportFilters = {
  status?: ReportStatus
  category?: string
  query?: string
}

export type StatusHistoryEntry = {
  id: string
  fromStatus: ReportStatus | null
  toStatus: ReportStatus
  changedBy: string
  changedAt: string
  comment: string | null
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

export interface Repository {
  findUserById(id: string): Promise<UserRecord | null>
  findUserByEmail(email: string): Promise<UserRecord | null>
  createSession(tokenHash: string, userId: string, expiresAt: number): Promise<void>
  findSession(tokenHash: string): Promise<{ userId: string } | null>
  deleteSession(tokenHash: string): Promise<void>
  updateAccount(id: string, name: string, passwordHash: string | null): Promise<Student | null>
  createUser(input: Omit<UserRecord, 'id' | 'role'>, role?: 'alumno' | 'mantenimiento'): Promise<Student>
  listUsers(): Promise<Student[]>
  createReport(userId: string, input: ReportInput, photoPath: string | null): Promise<ReportRecord>
  getReportPhotoPath(userId: string, role: UserRole, reportId: string): Promise<string | null>
  getReport(userId: string, role: UserRole, reportId: string): Promise<ReportRecord | null>
  listReports(userId: string, role: UserRole, filters: ReportFilters): Promise<ReportRecord[]>
  updateReportStatus(actorId: string, reportId: string, status: ReportStatus, comment: string | null): Promise<
    { report: ReportRecord } | { error: 'not_found' | 'unchanged' }
  >
  listStatusHistory(userId: string, role: UserRole, reportId: string): Promise<StatusHistoryEntry[]>
  listNotifications(userId: string): Promise<UserNotification[]>
  markNotificationRead(userId: string, notificationId: string): Promise<boolean>
  markAllNotificationsRead(userId: string): Promise<void>
  createSupportRequest(userId: string, subject: string, message: string): Promise<SupportRequest>
  listSupportRequests(userId: string, role: UserRole): Promise<SupportRequest[]>
  updateSupportRequestStatus(requestId: string, status: SupportRequest['status']): Promise<boolean>
}

declare global {
  namespace Express {
    interface Locals {
      student?: Student
    }
  }
}
