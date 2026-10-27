import { useState } from 'react'
import { Brand, Icon, type IconName } from '../components/Brand'
import type { Student } from './reportTypes'

type SettingsScreenProps = {
  student: Student
  onLogout: () => void
  onOpenHome: () => void
  onOpenReports: () => void
  onCreateReport: () => void
}

type SettingItem = {
  title: string
  description: string
  detail: string
  icon: IconName
}

const settingGroups: { heading: string; items: SettingItem[] }[] = [
  {
    heading: 'Cuenta',
    items: [{
      title: 'Datos de la cuenta',
      description: 'Cambia tu nombre, correo y contraseña.',
      detail: 'Tu cuenta pertenece al prototipo académico de ReportaYa.',
      icon: 'user',
    }],
  },
  {
    heading: 'Privacidad',
    items: [{
      title: 'Privacidad',
      description: 'Controla quién puede ver tu información y tus reportes.',
      detail: 'La información que ingresas en esta maqueta solo permanece durante la sesión actual.',
      icon: 'shield',
    }],
  },
  {
    heading: 'Notificaciones',
    items: [{
      title: 'Notificaciones',
      description: 'Gestiona las alertas y avisos de la plataforma.',
      detail: 'Las notificaciones se mostrarán cuando el sistema se conecte a un servicio real.',
      icon: 'bell',
    }],
  },
  {
    heading: 'Preferencias',
    items: [{
      title: 'Preferencias',
      description: 'Ajusta el idioma, tema y otras opciones.',
      detail: 'La interfaz está disponible en español y se adapta al tamaño de tu pantalla.',
      icon: 'settings',
    }],
  },
  {
    heading: 'Ayuda y soporte',
    items: [{
      title: 'Centro de ayuda',
      description: 'Consulta preguntas frecuentes y contacta al soporte.',
      detail: 'Para este avance, comparte tus comentarios con el equipo del proyecto.',
      icon: 'help',
    }],
  },
]

export function SettingsScreen({
  student,
  onLogout,
  onOpenHome,
  onOpenReports,
  onCreateReport,
}: SettingsScreenProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

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
          <span className="ry-profile-copy"><strong>{student.name}</strong><small>{student.email}</small><span className="ry-role-pill"><Icon name="user" size={12} /> Estudiante</span></span>
          <Icon name="chevron" size={19} />
        </button>
        {expandedItem === 'profile' && <p className="ry-setting-detail ry-profile-detail">Número de control: {student.controlNumber || 'No proporcionado en esta demostración'}</p>}
        <div className="ry-settings-groups">
          {settingGroups.map((group) => (
            <section className="ry-settings-group" key={group.heading}>
              <h2>{group.heading}</h2>
              {group.items.map((item) => {
                const expanded = expandedItem === item.title
                return (
                  <div className="ry-setting-wrap" key={item.title}>
                    <button aria-expanded={expanded} className="ry-setting-row" onClick={() => setExpandedItem(expanded ? null : item.title)} type="button">
                      <span className="ry-setting-icon"><Icon name={item.icon} size={19} /></span>
                      <span className="ry-setting-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                      <Icon name="chevron" size={18} />
                    </button>
                    {expanded && <p className="ry-setting-detail">{item.detail}</p>}
                  </div>
                )
              })}
            </section>
          ))}
          <section className="ry-settings-group">
            <h2>Cerrar sesión</h2>
            <button className="ry-setting-row" onClick={onLogout} type="button">
              <span className="ry-setting-icon ry-setting-icon--logout"><Icon name="logout" size={19} /></span>
              <span className="ry-setting-copy"><strong>Cerrar sesión</strong><small>Sal de tu cuenta de forma segura.</small></span>
              <Icon name="chevron" size={18} />
            </button>
          </section>
        </div>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav ry-bottom-nav--four">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Mis reportes</span></button>
        <button onClick={onCreateReport} type="button"><Icon name="plus" /><span>Crear reporte</span></button>
        <button aria-current="page" className="is-active" type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
