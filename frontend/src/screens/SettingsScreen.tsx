import { useState } from 'react'
import { Brand, Icon, type IconName } from '../components/Brand'
import type { Student } from './reportTypes'

type SettingsScreenProps = {
  student: Student
  onLogout: () => Promise<void>
  onManageUsers: () => void
  onOpenAccount: () => void
  onOpenPrivacy: () => void
  onOpenNotifications: () => void
  onOpenPreferences: () => void
  onOpenHelp: () => void
  onOpenHome: () => void
  onOpenReports: () => void
  onCreateReport: () => void
}

type SettingItem = {
  title: string
  description: string
  icon: IconName
  onClick: () => void
}

export function SettingsScreen({
  student,
  onLogout,
  onManageUsers,
  onOpenAccount,
  onOpenPrivacy,
  onOpenNotifications,
  onOpenPreferences,
  onOpenHelp,
  onOpenHome,
  onOpenReports,
  onCreateReport,
}: SettingsScreenProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError('')
    try {
      await onLogout()
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'No se pudo cerrar sesión. Inténtalo de nuevo.')
    } finally {
      setLoggingOut(false)
    }
  }

  const settingGroups: { heading: string; items: SettingItem[] }[] = [
    { heading: 'Cuenta', items: [{ title: 'Datos de la cuenta', description: 'Actualiza tu nombre y contraseña.', icon: 'user', onClick: onOpenAccount }] },
    { heading: 'Privacidad', items: [{ title: 'Privacidad', description: 'Revisa cómo se protegen tus reportes y datos.', icon: 'shield', onClick: onOpenPrivacy }] },
    { heading: 'Notificaciones', items: [{ title: 'Notificaciones', description: 'Consulta los cambios recientes de tus reportes.', icon: 'bell', onClick: onOpenNotifications }] },
    { heading: 'Preferencias', items: [{ title: 'Apariencia', description: 'Elige el tema claro u oscuro para este navegador.', icon: 'settings', onClick: onOpenPreferences }] },
    { heading: 'Ayuda y soporte', items: [{ title: 'Centro de ayuda', description: 'Consulta preguntas frecuentes o envía una solicitud.', icon: 'help', onClick: onOpenHelp }] },
  ]

  return (
    <div className="ry-app-shell">
      <header className="ry-app-header">
        <div className="ry-app-header-inner">
          <Brand />
          <span aria-label="Sesión activa" className="ry-avatar ry-avatar--small">{student.name.slice(0, 1).toUpperCase()}{student.name.split(' ')[1]?.slice(0, 1).toUpperCase() ?? ''}</span>
        </div>
      </header>
      <main className="ry-settings-main">
        <div className="ry-settings-intro">
          <p className="ry-overline">Tu espacio personal</p>
          <h1>Configuración</h1>
          <p>Administra tu cuenta y personaliza tu experiencia en la plataforma.</p>
        </div>
        <button className="ry-profile-card" onClick={() => setExpandedItem(expandedItem === 'profile' ? null : 'profile')} type="button" aria-expanded={expandedItem === 'profile'}>
          <span className="ry-avatar ry-avatar--large">{student.name.slice(0, 1).toUpperCase()}{student.name.split(' ')[1]?.slice(0, 1).toUpperCase() ?? ''}</span>
          <span className="ry-profile-copy"><strong>{student.name}</strong><small>{student.email}</small><span className="ry-role-pill"><Icon name="user" size={12} /> {student.role === 'administrador' ? 'Administrador' : student.role === 'mantenimiento' ? 'Mantenimiento' : 'Estudiante'}</span></span>
          <Icon name="chevron" size={19} />
        </button>
        {expandedItem === 'profile' && <p className="ry-setting-detail ry-profile-detail">Número de control: {student.controlNumber || 'No proporcionado en esta demostración'}</p>}
        <div className="ry-settings-groups">
          {student.role === 'administrador' && (
            <section className="ry-settings-group">
              <h2>Administración</h2>
              <button className="ry-setting-row" onClick={onManageUsers} type="button">
                <span className="ry-setting-icon"><Icon name="user" size={19} /></span>
                <span className="ry-setting-copy"><strong>Gestionar usuarios</strong><small>Asigna roles de alumno, mantenimiento o administración.</small></span>
                <Icon name="chevron" size={18} />
              </button>
            </section>
          )}
          {settingGroups.map((group) => (
            <section className="ry-settings-group" key={group.heading}>
              <h2>{group.heading}</h2>
              {group.items.map((item) => {
                return (
                  <button className="ry-setting-row" key={item.title} onClick={item.onClick} type="button">
                    <span className="ry-setting-icon"><Icon name={item.icon} size={19} /></span>
                    <span className="ry-setting-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                    <Icon name="chevron" size={18} />
                  </button>
                )
              })}
            </section>
          ))}
          <section className="ry-settings-group">
            <h2>Cerrar sesión</h2>
            <button className="ry-setting-row" disabled={loggingOut} onClick={() => void handleLogout()} type="button">
              <span className="ry-setting-icon ry-setting-icon--logout"><Icon name="logout" size={19} /></span>
              <span className="ry-setting-copy"><strong>{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</strong><small>{logoutError || 'Sal de tu cuenta de forma segura.'}</small></span>
              <Icon name="chevron" size={18} />
            </button>
          </section>
        </div>
      </main>
      <nav aria-label="Navegación principal" className={`ry-bottom-nav${student.role === 'alumno' ? ' ry-bottom-nav--four' : ''}`}>
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>{student.role === 'alumno' ? 'Mis reportes' : 'Reportes'}</span></button>
        {student.role === 'alumno' && <button onClick={onCreateReport} type="button"><Icon name="plus" /><span>Crear reporte</span></button>}
        <button aria-current="page" className="is-active" type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
