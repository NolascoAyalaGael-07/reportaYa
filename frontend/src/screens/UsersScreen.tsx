import { useEffect, useState, type FormEvent } from 'react'
import { createMaintenanceUser, errorMessage, listUsers } from '../api'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type UsersScreenProps = {
  currentUser: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenReports: () => void
  onOpenNotifications: () => void
}

const roleLabels: Record<Student['role'], string> = {
  alumno: 'Alumno',
  mantenimiento: 'Mantenimiento',
  administrador: 'Administrador',
}

export function UsersScreen({ currentUser, onBack, onOpenHome, onOpenReports, onOpenNotifications }: UsersScreenProps) {
  const [users, setUsers] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)
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

  async function handleCreateMaintenanceUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setCreatingUser(true)
    setError('')
    setSuccess('')
    try {
      const created = await createMaintenanceUser({
        name: String(formData.get('name')).trim(),
        controlNumber: String(formData.get('controlNumber')).trim(),
        email: String(formData.get('email')).trim(),
        password: String(formData.get('password')),
      })
      setUsers((current) => [created, ...current])
      setSuccess(`Se agregó a ${created.name} al equipo de mantenimiento.`)
      form.reset()
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setCreatingUser(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const text = `${user.name} ${user.email} ${user.controlNumber}`.toLocaleLowerCase('es-MX')
    return (selectedRole === 'todos' || user.role === selectedRole) && text.includes(query.trim().toLocaleLowerCase('es-MX'))
  })

  return (
    <div className="ry-app-shell">
      <AppHeader name={currentUser.name} onOpenNotifications={onOpenNotifications} />
      <main className="ry-users-main">
        <button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <div className="ry-users-heading">
          <div><p className="ry-overline">Solo administración</p><h1>Gestionar usuarios</h1><p className="ry-users-intro">Consulta las cuentas y agrega personal de mantenimiento.</p></div>
          <span className="ry-users-count">{users.length} cuentas</span>
        </div>
        <section aria-labelledby="create-maintenance-title" className="ry-create-user-section">
          <h2 id="create-maintenance-title">Agregar usuario de mantenimiento</h2>
          <p>La cuenta se creará directamente con permisos de mantenimiento.</p>
          <form className="ry-account-form" onSubmit={(event) => void handleCreateMaintenanceUser(event)}>
            <label htmlFor="maintenance-name">Nombre completo</label>
            <input autoComplete="name" id="maintenance-name" maxLength={150} minLength={2} name="name" required />
            <label htmlFor="maintenance-control">Número de control o empleado</label>
            <input autoComplete="off" id="maintenance-control" maxLength={30} minLength={2} name="controlNumber" required />
            <label htmlFor="maintenance-email">Correo electrónico</label>
            <input autoComplete="email" id="maintenance-email" maxLength={254} name="email" required type="email" />
            <label htmlFor="maintenance-password">Contraseña inicial</label>
            <input autoComplete="new-password" id="maintenance-password" maxLength={128} minLength={8} name="password" required type="password" />
            <small>El usuario podrá cambiarla desde los datos de su cuenta.</small>
            <button className="ry-button ry-button--primary" disabled={creatingUser} type="submit">{creatingUser ? 'Agregando…' : 'Agregar usuario'}</button>
          </form>
        </section>
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
