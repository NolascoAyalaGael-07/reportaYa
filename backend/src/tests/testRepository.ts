import type { Repository, ReportInput, ReportRecord, Student, UserRecord } from '../types.js'

export class TestRepository implements Repository {
  readonly users: UserRecord[] = []
  readonly reports: ReportRecord[] = []
  private nextUserId = 1
  private nextReportId = 1

  async findUserByEmail(email: string) {
    return this.users.find((user) => user.email === email) ?? null
  }

  async createUser(input: Omit<UserRecord, 'id' | 'role'>): Promise<Student> {
    if (this.users.some((user) => user.email === input.email || user.controlNumber === input.controlNumber)) {
      throw Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' })
    }

    const user = { ...input, id: String(this.nextUserId++), role: 'alumno' as const }
    this.users.push(user)
    const { passwordHash: _passwordHash, ...student } = user
    return student
  }

  async listUsers() {
    return this.users.map(({ passwordHash: _passwordHash, ...student }) => student)
  }

  async updateUserRole(actorId: string, targetId: string, role: UserRecord['role']) {
    const target = this.users.find((user) => user.id === targetId)
    if (!target) return { error: 'not_found' as const }
    if (actorId === targetId && target.role !== role) return { error: 'self' as const }
    if (
      target.role === 'administrador'
      && role !== 'administrador'
      && this.users.filter((user) => user.role === 'administrador').length <= 1
    ) {
      return { error: 'last_admin' as const }
    }

    target.role = role
    const { passwordHash: _passwordHash, ...student } = target
    return { student }
  }

  async createReport(userId: string, input: ReportInput) {
    const report = {
      ...input,
      id: String(this.nextReportId++),
      date: '2026-10-26',
    }
    this.reports.unshift(report)
    return report
  }

  async listReports(_userId: string) {
    return [...this.reports]
  }
}
