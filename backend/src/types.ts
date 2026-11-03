export type Student = {
  id: string
  name: string
  controlNumber: string
  email: string
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
}

export interface Repository {
  findUserByEmail(email: string): Promise<UserRecord | null>
  createUser(input: Omit<UserRecord, 'id'>): Promise<Student>
  createReport(userId: string, input: ReportInput): Promise<ReportRecord>
  listReports(userId: string): Promise<ReportRecord[]>
}

declare global {
  namespace Express {
    interface Locals {
      student?: Student
    }
  }
}
