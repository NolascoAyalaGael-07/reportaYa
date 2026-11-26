import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise'
import type { Repository, ReportFilters, ReportInput, ReportRecord, Student, StatusHistoryEntry, SupportRequest, UserNotification, UserRecord, UserRole } from './types.js'

type Environment = Record<string, string | undefined>

type UserRow = RowDataPacket & {
  id: string
  name: string
  controlNumber: string
  email: string
  passwordHash: string
  role: UserRole
}

type ReportRow = RowDataPacket & {
  id: string
  title: string
  category: string
  location: string
  description: string
  status: ReportRecord['status']
  date: string
  reporterName: string
  reporterControlNumber: string
  photoPath: string | null
}

type HistoryRow = RowDataPacket & {
  id: string
  fromStatus: ReportRecord['status'] | null
  toStatus: ReportRecord['status']
  changedBy: string
  changedAt: string
  comment: string | null
}

type NotificationRow = RowDataPacket & UserNotification
type SupportRequestRow = RowDataPacket & SupportRequest

function toReport(row: ReportRow): ReportRecord {
  return {
    id: String(row.id),
    title: row.title,
    category: row.category,
    location: row.location,
    description: row.description,
    status: row.status,
    date: row.date,
    reporterName: row.reporterName,
    reporterControlNumber: row.reporterControlNumber,
    photoUrl: row.photoPath ? `/api/reports/${String(row.id)}/photo` : null,
  }
}

const reportSelect = `
  SELECT r.id, r.title, r.category, r.location, r.description, r.status,
    DATE_FORMAT(r.created_at, "%Y-%m-%d") AS date,
    u.name AS reporterName, u.control_number AS reporterControlNumber,
    r.photo_path AS photoPath
  FROM reports r JOIN users u ON u.id = r.user_id
`

export function createPool(environment: Environment): Pool {
  const { MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE } = environment
  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
    throw new Error('Configura MYSQL_HOST, MYSQL_USER y MYSQL_DATABASE en 01_Codigo_Fuente/backend/.env.')
  }

  const port = Number(environment.MYSQL_PORT ?? 3306)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('MYSQL_PORT debe ser un número de puerto válido.')
  }

  return mysql.createPool({
    host: MYSQL_HOST,
    port,
    user: MYSQL_USER,
    password: environment.MYSQL_PASSWORD ?? '',
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  })
}

function toStudent(row: UserRow): Student {
  return {
    id: String(row.id),
    name: row.name,
    controlNumber: row.controlNumber,
    email: row.email,
    role: row.role,
  }
}

export function createMysqlRepository(pool: Pool): Repository {
  return {
    async findUserById(id) {
      const [rows] = await pool.execute<UserRow[]>(
        'SELECT id, name, control_number AS controlNumber, email, password_hash AS passwordHash, role FROM users WHERE id = ? LIMIT 1',
        [id],
      )
      const row = rows[0]
      return row ? { ...toStudent(row), passwordHash: row.passwordHash } : null
    },

    async findUserByEmail(email: string) {
      const [rows] = await pool.execute<UserRow[]>(
        'SELECT id, name, control_number AS controlNumber, email, password_hash AS passwordHash, role FROM users WHERE email = ? LIMIT 1',
        [email],
      )
      const row = rows[0]
      return row ? { ...toStudent(row), passwordHash: row.passwordHash } : null
    },

    async createSession(tokenHash, userId, expiresAt) {
      await pool.execute('DELETE FROM auth_sessions WHERE expires_at <= CURRENT_TIMESTAMP')
      await pool.execute(
        'INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
        [tokenHash, userId, new Date(expiresAt)],
      )
    },

    async findSession(tokenHash) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT user_id AS userId FROM auth_sessions WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP LIMIT 1',
        [tokenHash],
      )
      const row = rows[0] as { userId: string } | undefined
      return row ? { userId: String(row.userId) } : null
    },

    async deleteSession(tokenHash) {
      await pool.execute('DELETE FROM auth_sessions WHERE token_hash = ?', [tokenHash])
    },

    async updateAccount(id, name, passwordHash) {
      await pool.execute(
        'UPDATE users SET name = ?, password_hash = COALESCE(?, password_hash) WHERE id = ?',
        [name, passwordHash, id],
      )
      return this.findUserById(id).then((user) => {
        if (!user) return null
        const { passwordHash: _passwordHash, ...student } = user
        return student
      })
    },

    async createUser(input: Omit<UserRecord, 'id' | 'role'>, role: 'alumno' | 'mantenimiento' = 'alumno') {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO users (name, control_number, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [input.name, input.controlNumber, input.email, input.passwordHash, role],
      )
      return {
        id: String(result.insertId),
        name: input.name,
        controlNumber: input.controlNumber,
        email: input.email,
        role,
      }
    },

    async listUsers() {
      const [rows] = await pool.execute<UserRow[]>(
        'SELECT id, name, control_number AS controlNumber, email, password_hash AS passwordHash, role FROM users ORDER BY name, id',
      )
      return rows.map(toStudent)
    },

    async createReport(userId: string, input: ReportInput, photoPath: string | null) {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        const [result] = await connection.execute<ResultSetHeader>(
          'INSERT INTO reports (user_id, title, category, location, description, status, photo_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, input.title, input.category, input.location, input.description, input.status, photoPath],
        )
        await connection.execute(
          'INSERT INTO report_status_history (report_id, from_status, to_status, changed_by) VALUES (?, NULL, ?, ?)',
          [result.insertId, input.status, userId],
        )
        const [rows] = await connection.execute<ReportRow[]>(
          `${reportSelect} WHERE r.id = ? LIMIT 1`,
          [result.insertId],
        )
        const row = rows[0]
        if (!row) throw new Error('MySQL no devolvió el reporte recién creado.')
        await connection.commit()
        return toReport(row)
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    },

    async getReport(userId: string, role: UserRole, reportId: string) {
      const ownership = role === 'alumno' ? ' AND r.user_id = ?' : ''
      const parameters = role === 'alumno' ? [reportId, userId] : [reportId]
      const [rows] = await pool.execute<ReportRow[]>(
        `${reportSelect} WHERE r.id = ?${ownership} LIMIT 1`,
        parameters,
      )
      return rows[0] ? toReport(rows[0]) : null
    },

    async getReportPhotoPath(userId, role, reportId) {
      const ownership = role === 'alumno' ? ' AND user_id = ?' : ''
      const parameters = role === 'alumno' ? [reportId, userId] : [reportId]
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT photo_path AS photoPath FROM reports WHERE id = ?${ownership} LIMIT 1`,
        parameters,
      )
      const row = rows[0] as { photoPath: string | null } | undefined
      return row?.photoPath ?? null
    },

    async listReports(userId: string, role: UserRole, filters: ReportFilters) {
      const conditions: string[] = []
      const parameters: (string | number)[] = []
      if (role === 'alumno') {
        conditions.push('r.user_id = ?')
        parameters.push(userId)
      }
      if (filters.status) {
        conditions.push('r.status = ?')
        parameters.push(filters.status)
      }
      if (filters.category) {
        conditions.push('r.category = ?')
        parameters.push(filters.category)
      }
      if (filters.query) {
        conditions.push('(r.title LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR u.name LIKE ? OR u.control_number LIKE ?)')
        const search = `%${filters.query}%`
        parameters.push(search, search, search, search, search)
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      const [rows] = await pool.execute<ReportRow[]>(
        `${reportSelect} ${where} ORDER BY r.created_at DESC, r.id DESC LIMIT 200`,
        parameters,
      )
      return rows.map(toReport)
    },

    async updateReportStatus(actorId, actorRole, reportId, status, comment) {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        const [rows] = await connection.execute<RowDataPacket[]>(
          'SELECT status, user_id AS userId FROM reports WHERE id = ? FOR UPDATE',
          [reportId],
        )
        const row = rows[0] as { status: ReportRecord['status']; userId: string } | undefined
        if (!row) {
          await connection.rollback()
          return { error: 'not_found' as const }
        }
        if (row.status === status) {
          await connection.rollback()
          return { error: 'unchanged' as const }
        }
        if (actorRole === 'mantenimiento' && row.status === 'Solucionado') {
          await connection.rollback()
          return { error: 'already_solved' as const }
        }

        await connection.execute('UPDATE reports SET status = ? WHERE id = ?', [status, reportId])
        await connection.execute(
          'INSERT INTO report_status_history (report_id, from_status, to_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)',
          [reportId, row.status, status, actorId, comment],
        )
        if (String(row.userId) !== actorId) {
          const message = comment
            ? `El estado cambió de ${row.status} a ${status}. ${comment}`
            : `El estado cambió de ${row.status} a ${status}.`
          await connection.execute(
            'INSERT INTO user_notifications (user_id, report_id, title, message) VALUES (?, ?, ?, ?)',
            [row.userId, reportId, 'Actualización de tu reporte', message],
          )
        }
        const [updatedRows] = await connection.execute<ReportRow[]>(
          `${reportSelect} WHERE r.id = ? LIMIT 1`,
          [reportId],
        )
        const updated = updatedRows[0]
        if (!updated) throw new Error('MySQL no devolvió el reporte actualizado.')
        await connection.commit()
        return { report: toReport(updated) }
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    },

    async listStatusHistory(userId, role, reportId) {
      const ownership = role === 'alumno' ? ' AND r.user_id = ?' : ''
      const parameters = role === 'alumno' ? [reportId, userId] : [reportId]
      const [rows] = await pool.execute<HistoryRow[]>(
        `SELECT h.id, h.from_status AS fromStatus, h.to_status AS toStatus,
          u.name AS changedBy, DATE_FORMAT(h.changed_at, "%Y-%m-%d %H:%i:%s") AS changedAt, h.comment
        FROM report_status_history h
        JOIN reports r ON r.id = h.report_id
        JOIN users u ON u.id = h.changed_by
        WHERE h.report_id = ?${ownership}
        ORDER BY h.changed_at ASC, h.id ASC`,
        parameters,
      )
      return rows.map((row): StatusHistoryEntry => ({
        ...row,
        id: String(row.id),
      }))
    },

    async listNotifications(userId) {
      const [rows] = await pool.execute<NotificationRow[]>(
        `SELECT id, report_id AS reportId, title, message,
          DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS createdAt,
          DATE_FORMAT(read_at, "%Y-%m-%d %H:%i:%s") AS readAt
        FROM user_notifications
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 100`,
        [userId],
      )
      return rows.map((row) => ({ ...row, id: String(row.id), reportId: String(row.reportId) }))
    },

    async markNotificationRead(userId, notificationId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM user_notifications WHERE id = ? AND user_id = ? LIMIT 1',
        [notificationId, userId],
      )
      if (rows.length === 0) return false
      await pool.execute(
        'UPDATE user_notifications SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = ? AND user_id = ?',
        [notificationId, userId],
      )
      return true
    },

    async markAllNotificationsRead(userId) {
      await pool.execute(
        'UPDATE user_notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL',
        [userId],
      )
    },

    async createSupportRequest(userId, subject, message) {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO support_requests (user_id, subject, message) VALUES (?, ?, ?)',
        [userId, subject, message],
      )
      const [rows] = await pool.execute<SupportRequestRow[]>(
        `SELECT s.id, s.subject, s.message, s.status,
          DATE_FORMAT(s.created_at, "%Y-%m-%d %H:%i:%s") AS createdAt,
          u.name AS requesterName, u.email AS requesterEmail
        FROM support_requests s JOIN users u ON u.id = s.user_id
        WHERE s.id = ? LIMIT 1`,
        [result.insertId],
      )
      const row = rows[0]
      if (!row) throw new Error('MySQL no devolvió la solicitud de soporte recién creada.')
      return { ...row, id: String(row.id) }
    },

    async listSupportRequests(userId, role) {
      const ownerFilter = role === 'administrador' ? '' : 'WHERE s.user_id = ?'
      const parameters = role === 'administrador' ? [] : [userId]
      const [rows] = await pool.execute<SupportRequestRow[]>(
        `SELECT s.id, s.subject, s.message, s.status,
          DATE_FORMAT(s.created_at, "%Y-%m-%d %H:%i:%s") AS createdAt,
          u.name AS requesterName, u.email AS requesterEmail
        FROM support_requests s JOIN users u ON u.id = s.user_id
        ${ownerFilter}
        ORDER BY s.created_at DESC, s.id DESC
        LIMIT 100`,
        parameters,
      )
      return rows.map((row) => ({ ...row, id: String(row.id) }))
    },

    async updateSupportRequestStatus(requestId, status) {
      const [result] = status === 'Resuelta'
        ? await pool.execute<ResultSetHeader>(
          'UPDATE support_requests SET status = ?, resolved_at = COALESCE(resolved_at, CURRENT_TIMESTAMP) WHERE id = ?',
          [status, requestId],
        )
        : await pool.execute<ResultSetHeader>(
          'UPDATE support_requests SET status = ?, resolved_at = NULL WHERE id = ?',
          [status, requestId],
        )
      return result.affectedRows > 0
    },
  }
}
