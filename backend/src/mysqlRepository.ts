import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise'
import type { Repository, ReportInput, ReportRecord, Student, UserRecord } from './types.js'

type Environment = Record<string, string | undefined>

type UserRow = RowDataPacket & {
  id: string
  name: string
  controlNumber: string
  email: string
  passwordHash: string
}

type ReportRow = RowDataPacket & {
  id: string
  title: string
  category: string
  location: string
  description: string
  status: ReportRecord['status']
  date: string
}

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
  })
}

function toStudent(row: UserRow): Student {
  return {
    id: String(row.id),
    name: row.name,
    controlNumber: row.controlNumber,
    email: row.email,
  }
}

export function createMysqlRepository(pool: Pool): Repository {
  return {
    async findUserByEmail(email: string) {
      const [rows] = await pool.execute<UserRow[]>(
        'SELECT id, name, control_number AS controlNumber, email, password_hash AS passwordHash FROM users WHERE email = ? LIMIT 1',
        [email],
      )
      const row = rows[0]
      return row ? { ...toStudent(row), passwordHash: row.passwordHash } : null
    },

    async createUser(input: Omit<UserRecord, 'id'>) {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO users (name, control_number, email, password_hash) VALUES (?, ?, ?, ?)',
        [input.name, input.controlNumber, input.email, input.passwordHash],
      )
      return {
        id: String(result.insertId),
        name: input.name,
        controlNumber: input.controlNumber,
        email: input.email,
      }
    },

    async createReport(userId: string, input: ReportInput) {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO reports (user_id, title, category, location, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, input.title, input.category, input.location, input.description, input.status],
      )
      const [rows] = await pool.execute<ReportRow[]>(
        'SELECT id, title, category, location, description, status, DATE_FORMAT(created_at, "%Y-%m-%d") AS date FROM reports WHERE id = ? LIMIT 1',
        [result.insertId],
      )
      const row = rows[0]
      if (!row) throw new Error('MySQL no devolvió el reporte recién creado.')
      return { ...row, id: String(row.id) }
    },

    async listReports(userId: string) {
      const [rows] = await pool.execute<ReportRow[]>(
        'SELECT id, title, category, location, description, status, DATE_FORMAT(created_at, "%Y-%m-%d") AS date FROM reports WHERE user_id = ? ORDER BY created_at DESC, id DESC',
        [userId],
      )
      return rows.map((row) => ({ ...row, id: String(row.id) }))
    },
  }
}
