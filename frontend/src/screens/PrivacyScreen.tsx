import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type PrivacyScreenProps = {
  student: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenNotifications: () => void
  onOpenReports: () => void
}

export function PrivacyScreen({ student, onBack, onOpenHome, onOpenNotifications, onOpenReports }: PrivacyScreenProps) {
  const visibility = student.role === 'alumno'
    ? 'Tus reportes solo son visibles para ti y para el personal autorizado de mantenimiento y administración.'
    : 'Tu rol permite consultar reportes del plantel para apoyar su seguimiento. Solo administración puede gestionar roles.'

  return (
    <div className="ry-app-shell">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="ry-account-main">
        <button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="ry-overline">Tus datos y reportes</p>
        <h1>Privacidad</h1>
        <p className="ry-account-intro">La plataforma aplica estos controles en cada consulta al servidor.</p>
        <section className="ry-privacy-card">
          <span className="ry-setting-icon"><Icon name="shield" size={22} /></span>
          <div><h2>Acceso a tus reportes</h2><p>{visibility}</p></div>
        </section>
        <section className="ry-privacy-card">
          <span className="ry-setting-icon"><Icon name="lock" size={22} /></span>
          <div><h2>Contraseña</h2><p>Tu contraseña se guarda como hash y nunca se muestra en tu perfil ni en la lista de usuarios.</p></div>
        </section>
        <section className="ry-privacy-card">
          <span className="ry-setting-icon"><Icon name="user" size={22} /></span>
          <div><h2>Correo y número de control</h2><p>Estos datos identifican tu cuenta y no se pueden editar desde la aplicación.</p></div>
        </section>
        <p className="ry-privacy-note">La visibilidad de los reportes es una regla de seguridad del sistema y no puede desactivarse desde la cuenta.</p>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Reportes</span></button>
        <button aria-current="page" className="is-active" onClick={onBack} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
