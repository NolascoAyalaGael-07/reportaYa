import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise'
import type { Repository, ReportFilters, ReportInput, ReportRecord, Student, StatusHistoryEntry, UserRecord, UserRole } from './types.js'

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
    throw new Error('Configura MYSQL_HOST, MYSQL_USER y MYSQL_DATABASE en backend/.env.')
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

    async createUser(input: Omit<UserRecord, 'id' | 'role'>) {
      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO users (name, control_number, email, password_hash, role) VALUES (?, ?, ?, ?, 'alumno')",
        [input.name, input.controlNumber, input.email, input.passwordHash],
      )
      return {
        id: String(result.insertId),
        name: input.name,
        controlNumber: input.controlNumber,
        email: input.email,
        role: 'alumno',
      }
    },

    async listUsers() {
      const [rows] = await pool.execute<UserRow[]>(
        'SELECT id, name, control_number AS controlNumber, email, password_hash AS passwordHash, role FROM users ORDER BY name, id',
      )
      return rows.map(toStudent)
    },

    async updateUserRole(actorId, targetId, role) {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        const [admins] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM users WHERE role = 'administrador' FOR UPDATE",
        )
        const [rows] = await connection.execute<UserRow[]>(
          'SELECT id, name, control_number AS controlNumber, email, password_hash AS passwordHash, role FROM users WHERE id = ? FOR UPDATE',
          [targetId],
        )
        const target = rows[0]
        if (!target) {
          await connection.rollback()
          return { error: 'not_found' as const }
        }
        if (actorId === targetId && target.role !== role) {
          await connection.rollback()
          return { error: 'self' as const }
        }
        if (target.role === 'administrador' && role !== 'administrador' && admins.length <= 1) {
          await connection.rollback()
          return { error: 'last_admin' as const }
        }

        await connection.execute('UPDATE users SET role = ? WHERE id = ?', [role, targetId])
        await connection.commit()
        return { student: { ...toStudent(target), role } }
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
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

    async updateReportStatus(actorId, reportId, status, comment) {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        const [rows] = await connection.execute<RowDataPacket[]>(
          'SELECT status FROM reports WHERE id = ? FOR UPDATE',
          [reportId],
        )
        const row = rows[0] as { status: ReportRecord['status'] } | undefined
        if (!row) {
          await connection.rollback()
          return { error: 'not_found' as const }
        }
        if (row.status === status) {
          await connection.rollback()
          return { error: 'unchanged' as const }
        }

        await connection.execute('UPDATE reports SET status = ? WHERE id = ?', [status, reportId])
        await connection.execute(
          'INSERT INTO report_status_history (report_id, from_status, to_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)',
          [reportId, row.status, status, actorId, comment],
        )
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
  }
}
