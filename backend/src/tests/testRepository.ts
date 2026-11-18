import type { Repository, ReportFilters, ReportInput, ReportRecord, ReportStatus, Student, StatusHistoryEntry, SupportRequest, UserNotification, UserRecord, UserRole } from '../types.js'

export class TestRepository implements Repository {
  readonly users: UserRecord[] = []
  readonly reports: ReportRecord[] = []
  readonly sessions = new Map<string, { userId: string; expiresAt: number }>()
  readonly history = new Map<string, StatusHistoryEntry[]>()
  readonly notifications: UserNotification[] = []
  readonly supportRequests: SupportRequest[] = []
  private readonly reportOwners = new Map<string, string>()
  private readonly reportPhotos = new Map<string, string>()
  private nextUserId = 1
  private nextReportId = 1
  private nextNotificationId = 1
  private nextSupportRequestId = 1

  async findUserById(id: string) {
    return this.users.find((user) => user.id === id) ?? null
  }

  async findUserByEmail(email: string) {
    return this.users.find((user) => user.email === email) ?? null
  }

  async createSession(tokenHash: string, userId: string, expiresAt: number) {
    this.sessions.set(tokenHash, { userId, expiresAt })
  }

  async findSession(tokenHash: string) {
    const session = this.sessions.get(tokenHash)
    if (!session || session.expiresAt <= Date.now()) {
      this.sessions.delete(tokenHash)
      return null
    }
    return { userId: session.userId }
  }

  async deleteSession(tokenHash: string) {
    this.sessions.delete(tokenHash)
  }

  async updateAccount(id: string, name: string, passwordHash: string | null) {
    const user = this.users.find((candidate) => candidate.id === id)
    if (!user) return null
    user.name = name
    if (passwordHash) user.passwordHash = passwordHash
    const { passwordHash: _passwordHash, ...student } = user
    return student
  }

  async createUser(input: Omit<UserRecord, 'id' | 'role'>, role: 'alumno' | 'mantenimiento' = 'alumno'): Promise<Student> {
    if (this.users.some((user) => user.email === input.email || user.controlNumber === input.controlNumber)) {
      throw Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' })
    }

    const user = { ...input, id: String(this.nextUserId++), role }
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
    const ownerId = this.reportOwners.get(reportId)
    if (ownerId && ownerId !== actorId) {
      this.notifications.unshift({
        id: String(this.nextNotificationId++),
        reportId,
        title: 'Actualización de tu reporte',
        message: comment
          ? `El estado cambió de ${previousStatus} a ${status}. ${comment}`
          : `El estado cambió de ${previousStatus} a ${status}.`,
        createdAt: '2026-10-26 11:00:00',
        readAt: null,
      })
    }
    return { report: { ...report } }
  }

  async listStatusHistory(userId: string, role: UserRole, reportId: string) {
    if (role === 'alumno' && this.reportOwners.get(reportId) !== userId) return []
    return [...(this.history.get(reportId) ?? [])]
  }

  async listNotifications(userId: string) {
    return this.notifications.filter((notification) => this.reportOwners.get(notification.reportId) === userId)
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = this.notifications.find((item) => item.id === notificationId)
    if (!notification || this.reportOwners.get(notification.reportId) !== userId) return false
    notification.readAt ??= '2026-10-26 12:00:00'
    return true
  }

  async markAllNotificationsRead(userId: string) {
    for (const notification of this.notifications) {
      if (this.reportOwners.get(notification.reportId) === userId) {
        notification.readAt ??= '2026-10-26 12:00:00'
      }
    }
  }

  async createSupportRequest(userId: string, subject: string, message: string) {
    const requester = this.users.find((user) => user.id === userId)
    if (!requester) throw new Error('Support request owner does not exist')
    const supportRequest = {
      id: String(this.nextSupportRequestId++),
      subject,
      message,
      status: 'Abierta' as const,
      createdAt: '2026-10-26 12:00:00',
      requesterName: requester.name,
      requesterEmail: requester.email,
    }
    this.supportRequests.unshift(supportRequest)
    return supportRequest
  }

  async listSupportRequests(userId: string, role: UserRole) {
    return this.supportRequests.filter((request) => (
      role === 'administrador'
      || this.users.find((user) => user.email === request.requesterEmail)?.id === userId
    ))
  }

  async updateSupportRequestStatus(requestId: string, status: SupportRequest['status']) {
    const supportRequest = this.supportRequests.find((request) => request.id === requestId)
    if (!supportRequest) return false
    supportRequest.status = status
    return true
  }
}
