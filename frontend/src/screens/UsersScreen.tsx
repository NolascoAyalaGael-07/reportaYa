import { useEffect, useState } from 'react'
import { errorMessage, listUsers, updateUserRole } from '../api'
import { Brand, Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type UsersScreenProps = {
  currentUser: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenReports: () => void
}

const roleLabels: Record<Student['role'], string> = {
  alumno: 'Alumno',
  mantenimiento: 'Mantenimiento',
  administrador: 'Administrador',
}

export function UsersScreen({ currentUser, onBack, onOpenHome, onOpenReports }: UsersScreenProps) {
  const [users, setUsers] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingUser, setSavingUser] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void listUsers().then((items) => {
      if (active) setUsers(items)
    }).catch((reason: unknown) => {
      if (active) setError(errorMessage(reason))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleRoleChange(user: Student, role: Student['role']) {
    if (role === user.role) return
    setSavingUser(user.id)
    setError('')
    try {
      const updated = await updateUserRole(user.id, role)
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSavingUser(null)
    }
  }

  return (
    <div className="ry-app-shell">
      <header className="ry-app-header">
        <div className="ry-app-header-inner">
          <Brand />
          <span aria-label="Sesión activa" className="ry-avatar ry-avatar--small">{currentUser.name.slice(0, 1).toUpperCase()}</span>
        </div>
      </header>
      <main className="ry-users-main">
        <button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="ry-overline">Solo administración</p>
        <h1>Gestionar usuarios</h1>
        <p className="ry-users-intro">Asigna los permisos según la responsabilidad de cada integrante.</p>
        <div className="ry-role-explainer">
          <p><strong>Alumno</strong><span>Registra y consulta sus propios reportes.</span></p>
          <p><strong>Mantenimiento</strong><span>Consulta los reportes y actualiza su estado.</span></p>
          <p><strong>Administrador</strong><span>Gestiona los usuarios, reportes y sus estados.</span></p>
        </div>
        {error && <p className="ry-form-message" role="alert">{error}</p>}
        {loading ? (
          <p className="ry-empty-state" role="status">Cargando usuarios…</p>
        ) : (
          <div className="ry-user-list">
            {users.map((user) => (
              <article className="ry-user-card" key={user.id}>
                <span className="ry-avatar ry-avatar--user">{user.name.slice(0, 1).toUpperCase()}</span>
                <span className="ry-user-copy">
                  <strong>{user.name}{user.id === currentUser.id ? ' (tú)' : ''}</strong>
                  <small>{user.email} · {user.controlNumber}</small>
                  <small className="ry-user-role">{roleLabels[user.role]}</small>
                </span>
                <label className="ry-role-select-label">
                  <span className="ry-visually-hidden">Rol de {user.name}</span>
                  <select
                    disabled={savingUser !== null || user.id === currentUser.id}
                    onChange={(event) => void handleRoleChange(user, event.currentTarget.value as Student['role'])}
                    value={user.role}
                  >
                    {Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
                  </select>
                </label>
              </article>
            ))}
            {users.length === 0 && <p className="ry-empty-state">No se encontraron cuentas.</p>}
          </div>
        )}
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Reportes</span></button>
        <button aria-current="page" className="is-active" onClick={onBack} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
