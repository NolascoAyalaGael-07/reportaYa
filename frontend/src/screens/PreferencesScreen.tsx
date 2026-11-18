import { Brand, Icon } from '../components/Brand'
import type { Student } from './reportTypes'

export type Theme = 'light' | 'dark'

type PreferencesScreenProps = {
  student: Student
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onBack: () => void
  onOpenHome: () => void
  onOpenReports: () => void
}

export function PreferencesScreen({
  student,
  theme,
  onThemeChange,
  onBack,
  onOpenHome,
  onOpenReports,
}: PreferencesScreenProps) {
  return (
    <div className="ry-app-shell">
      <header className="ry-app-header"><div className="ry-app-header-inner"><Brand /><span className="ry-avatar ry-avatar--small">{student.name.slice(0, 1).toUpperCase()}</span></div></header>
      <main className="ry-account-main">
        <button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="ry-overline">Personaliza ReportaYa</p>
        <h1>Apariencia</h1>
        <p className="ry-account-intro">Elige el tema que prefieres. Se recordará en este navegador.</p>
        <fieldset className="ry-theme-options">
          <legend>Tema de la aplicación</legend>
          <label className={`ry-theme-option${theme === 'light' ? ' is-selected' : ''}`}>
            <input checked={theme === 'light'} name="theme" onChange={() => onThemeChange('light')} type="radio" value="light" />
            <span className="ry-theme-preview ry-theme-preview--light" aria-hidden="true"><i /><i /><i /></span>
            <span><strong>Claro</strong><small>Fondo claro y alto contraste</small></span>
            {theme === 'light' && <Icon name="check" size={18} />}
          </label>
          <label className={`ry-theme-option${theme === 'dark' ? ' is-selected' : ''}`}>
            <input checked={theme === 'dark'} name="theme" onChange={() => onThemeChange('dark')} type="radio" value="dark" />
            <span className="ry-theme-preview ry-theme-preview--dark" aria-hidden="true"><i /><i /><i /></span>
            <span><strong>Oscuro</strong><small>Menos brillo en espacios con poca luz</small></span>
            {theme === 'dark' && <Icon name="check" size={18} />}
          </label>
        </fieldset>
        <p className="ry-privacy-note">Idioma disponible: español.</p>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Reportes</span></button>
        <button aria-current="page" className="is-active" onClick={onBack} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
