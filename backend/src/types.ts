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

export interface Repository {
  findUserByEmail(email: string): Promise<UserRecord | null>
  createUser(input: Omit<UserRecord, 'id' | 'role'>): Promise<Student>
  listUsers(): Promise<Student[]>
  updateUserRole(actorId: string, targetId: string, role: UserRole): Promise<
    { student: Student } | { error: 'not_found' | 'last_admin' | 'self' }
  >
  createReport(userId: string, input: ReportInput): Promise<ReportRecord>
  getReport(userId: string, role: UserRole, reportId: string): Promise<ReportRecord | null>
  listReports(userId: string, role: UserRole, filters: ReportFilters): Promise<ReportRecord[]>
  updateReportStatus(actorId: string, reportId: string, status: ReportStatus, comment: string | null): Promise<
    { report: ReportRecord } | { error: 'not_found' | 'unchanged' }
  >
  listStatusHistory(userId: string, role: UserRole, reportId: string): Promise<StatusHistoryEntry[]>
}

declare global {
  namespace Express {
    interface Locals {
      student?: Student
    }
  }
}
