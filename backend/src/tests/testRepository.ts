import type { Repository, ReportFilters, ReportInput, ReportRecord, ReportStatus, Student, StatusHistoryEntry, UserRecord, UserRole } from '../types.js'

export class TestRepository implements Repository {
  readonly users: UserRecord[] = []
  readonly reports: ReportRecord[] = []
  readonly history = new Map<string, StatusHistoryEntry[]>()
  private readonly reportOwners = new Map<string, string>()
  private readonly reportPhotos = new Map<string, string>()
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

  async createReport(userId: string, input: ReportInput, photoPath: string | null) {
    const user = this.users.find((candidate) => candidate.id === userId)
    if (!user) throw new Error('Report owner does not exist')
    const id = String(this.nextReportId++)
    const report = {
      ...input,
      id,
      date: '2026-10-26',
      reporterName: user.name,
      reporterControlNumber: user.controlNumber,
      photoUrl: photoPath ? `/api/reports/${id}/photo` : null,
    }
    this.reportOwners.set(report.id, userId)
    if (photoPath) this.reportPhotos.set(report.id, photoPath)
    this.reports.unshift(report)
    this.history.set(report.id, [{
      id: `${report.id}-1`,
      fromStatus: null,
      toStatus: report.status,
      changedBy: user.name,
      changedAt: '2026-10-26 10:00:00',
      comment: null,
    }])
    return report
  }

  async getReport(userId: string, role: UserRole, reportId: string) {
    if (role === 'alumno' && this.reportOwners.get(reportId) !== userId) return null
    return this.reports.find((report) => report.id === reportId) ?? null
  }

  async getReportPhotoPath(userId: string, role: UserRole, reportId: string) {
    if (role === 'alumno' && this.reportOwners.get(reportId) !== userId) return null
    return this.reportPhotos.get(reportId) ?? null
  }

  async listReports(userId: string, role: UserRole, filters: ReportFilters) {
    return this.reports.filter((report) => (
      (role !== 'alumno' || this.reportOwners.get(report.id) === userId)
      && (!filters.status || report.status === filters.status)
      && (!filters.category || report.category === filters.category)
      && (!filters.query || `${report.title} ${report.description} ${report.location} ${report.reporterName} ${report.reporterControlNumber}`.toLowerCase().includes(filters.query.toLowerCase()))
    ))
  }

  async updateReportStatus(actorId: string, reportId: string, status: ReportStatus, comment: string | null) {
    const report = this.reports.find((candidate) => candidate.id === reportId)
    const actor = this.users.find((candidate) => candidate.id === actorId)
    if (!report || !actor) return { error: 'not_found' as const }
    if (report.status === status) return { error: 'unchanged' as const }

    const previousStatus = report.status
    report.status = status
    const entries = this.history.get(reportId) ?? []
    entries.push({
      id: `${reportId}-${entries.length + 1}`,
      fromStatus: previousStatus,
      toStatus: status,
      changedBy: actor.name,
      changedAt: '2026-10-26 11:00:00',
      comment,
    })
    this.history.set(reportId, entries)
    return { report: { ...report } }
  }

  async listStatusHistory(userId: string, role: UserRole, reportId: string) {
    if (role === 'alumno' && this.reportOwners.get(reportId) !== userId) return []
    return [...(this.history.get(reportId) ?? [])]
  }
}
