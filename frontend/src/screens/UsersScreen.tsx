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
  const [draftRoles, setDraftRoles] = useState<Record<string, Student['role']>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savingUser, setSavingUser] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<'todos' | Student['role']>('todos')

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
    setSuccess('')
    try {
      const updated = await updateUserRole(user.id, role)
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item))
      setDraftRoles((current) => ({ ...current, [updated.id]: updated.role }))
      setSuccess(`Se actualizó el rol de ${updated.name}.`)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSavingUser(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const text = `${user.name} ${user.email} ${user.controlNumber}`.toLocaleLowerCase('es-MX')
    return (selectedRole === 'todos' || user.role === selectedRole) && text.includes(query.trim().toLocaleLowerCase('es-MX'))
  })

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
        <div className="ry-users-heading">
          <div><p className="ry-overline">Solo administración</p><h1>Gestionar usuarios</h1><p className="ry-users-intro">Asigna permisos según la responsabilidad de cada integrante.</p></div>
          <span className="ry-users-count">{users.length} cuentas</span>
        </div>
        <div className="ry-role-explainer">
          <article><span className="ry-role-explainer-icon"><Icon name="user" size={17} /></span><strong>Alumno</strong><span>Registra y consulta sus reportes.</span></article>
          <article><span className="ry-role-explainer-icon"><Icon name="settings" size={17} /></span><strong>Mantenimiento</strong><span>Consulta reportes y actualiza estados.</span></article>
          <article><span className="ry-role-explainer-icon"><Icon name="shield" size={17} /></span><strong>Administrador</strong><span>Gestiona usuarios y reportes.</span></article>
        </div>
        {error && <p className="ry-form-message" role="alert">{error}</p>}
        {success && <p className="ry-success-message" role="status">{success}</p>}
        {loading ? (
          <p className="ry-empty-state" role="status">Cargando usuarios…</p>
        ) : (
          <>
            <section className="ry-users-toolbar" aria-label="Buscar y filtrar usuarios">
              <label className="ry-search-field"><Icon name="search" size={18} /><input aria-label="Buscar usuarios" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Buscar por nombre, correo o control" value={query} /></label>
              <div aria-label="Filtrar usuarios por rol" className="ry-status-filters">
                {(['todos', 'alumno', 'mantenimiento', 'administrador'] as const).map((role) => (
                  <button aria-pressed={selectedRole === role} className={selectedRole === role ? 'is-selected' : ''} key={role} onClick={() => setSelectedRole(role)} type="button">
                    {role === 'todos' ? 'Todos' : roleLabels[role]}
                  </button>
                ))}
              </div>
            </section>
            <div className="ry-user-list">
            {filteredUsers.map((user) => (
              <article className="ry-user-card" key={user.id}>
                <span className="ry-avatar ry-avatar--user">{user.name.slice(0, 1).toUpperCase()}{user.name.split(' ')[1]?.slice(0, 1).toUpperCase() ?? ''}</span>
                <span className="ry-user-copy">
                  <strong>{user.name}{user.id === currentUser.id ? ' (tú)' : ''}</strong>
                  <small>{user.email} · {user.controlNumber}</small>
                  <small className="ry-user-role">{roleLabels[user.role]}</small>
                </span>
                <label className="ry-role-select-label">
                  <span className="ry-visually-hidden">{`Rol de ${user.name}`}</span>
                  <select
                    disabled={savingUser !== null || user.id === currentUser.id}
                    onChange={(event) => {
                      const role = event.currentTarget.value as Student['role']
                      setDraftRoles((current) => ({ ...current, [user.id]: role }))
                    }}
                    value={draftRoles[user.id] ?? user.role}
                  >
                    {Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
                  </select>
                </label>
                <button
                  className="ry-button ry-button--outline ry-user-save"
                  disabled={savingUser !== null || user.id === currentUser.id || (draftRoles[user.id] ?? user.role) === user.role}
                  onClick={() => void handleRoleChange(user, draftRoles[user.id] ?? user.role)}
                  type="button"
                >
                  {savingUser === user.id ? 'Guardando…' : 'Guardar rol'}
                </button>
              </article>
            ))}
            {filteredUsers.length === 0 && <p className="ry-empty-state">No se encontraron cuentas con esos filtros.</p>}
            </div>
          </>
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
