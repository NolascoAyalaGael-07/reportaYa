import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Brand'
import type { Student } from './reportTypes'

export type Theme = 'light' | 'dark'

type PreferencesScreenProps = {
  student: Student
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onBack: () => void
  onOpenHome: () => void
  onOpenNotifications: () => void
  onOpenReports: () => void
}

export function PreferencesScreen({
  student,
  theme,
  onThemeChange,
  onBack,
  onOpenHome,
  onOpenNotifications,
  onOpenReports,
}: PreferencesScreenProps) {
  return (
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[860px] py-6 pb-[42px]">
        <button className="mb-[18px] inline-flex items-center gap-[7px] border-0 bg-transparent py-1.5 text-xs font-bold text-[var(--ry-blue)]" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">Personaliza ReportaYa</p>
        <h1 className="m-0 text-[27px] tracking-[-0.7px]">Apariencia</h1>
        <p className="mb-5 mt-[6px] text-xs leading-[1.55] text-[var(--ry-muted)]">Elige el tema que prefieres. Se recordará en este navegador.</p>
        <fieldset className="grid gap-[10px] rounded-[14px] border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-4">
          <legend className="px-1.5 text-xs font-bold">Tema de la aplicación</legend>
          <label className={`grid cursor-pointer grid-cols-[auto_72px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-[11px] transition-colors ${theme === 'light' ? 'border-[#82b4ed] bg-[var(--ry-blue-soft)]' : 'border-[var(--ry-line)]'}`}>
            <input checked={theme === 'light'} className="accent-[var(--ry-blue)]" name="theme" onChange={() => onThemeChange('light')} type="radio" value="light" />
            <span aria-hidden="true" className="grid h-[45px] w-[72px] content-center gap-1 rounded-lg border border-[#d5e0ed] bg-[#f4f8fc] p-[7px]"><i className="h-[5px] w-[70%] rounded bg-[#89b7eb]" /><i className="h-[5px] rounded bg-white" /><i className="h-[5px] rounded bg-white" /></span>
            <span className="grid gap-[3px]"><strong className="text-xs">Claro</strong><small className="text-[10px] text-[var(--ry-muted)]">Fondo claro y alto contraste</small></span>
            {theme === 'light' && <Icon className="text-[var(--ry-blue)]" name="check" size={18} />}
          </label>
          <label className={`grid cursor-pointer grid-cols-[auto_72px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-[11px] transition-colors ${theme === 'dark' ? 'border-[#82b4ed] bg-[var(--ry-blue-soft)]' : 'border-[var(--ry-line)]'}`}>
            <input checked={theme === 'dark'} className="accent-[var(--ry-blue)]" name="theme" onChange={() => onThemeChange('dark')} type="radio" value="dark" />
            <span aria-hidden="true" className="grid h-[45px] w-[72px] content-center gap-1 rounded-lg border border-[#344a62] bg-[#101e2d] p-[7px]"><i className="h-[5px] w-[70%] rounded bg-[#3284df]" /><i className="h-[5px] rounded bg-[#243a52]" /><i className="h-[5px] rounded bg-[#243a52]" /></span>
            <span className="grid gap-[3px]"><strong className="text-xs">Oscuro</strong><small className="text-[10px] text-[var(--ry-muted)]">Menos brillo en espacios con poca luz</small></span>
            {theme === 'dark' && <Icon className="text-[var(--ry-blue)]" name="check" size={18} />}
          </label>
        </fieldset>
        <p className="mt-[13px] text-[11px] leading-[1.6] text-[var(--ry-muted)]">Idioma disponible: español.</p>
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: 'Reportes', icon: 'reports', onClick: onOpenReports },
        { label: 'Mi cuenta', icon: 'user', onClick: onBack, active: true },
      ]} />
    </div>
  )
}
