import { useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon, type IconName } from '../components/Brand'
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
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[900px] py-[23px] pb-[34px]">
        <div>
          <p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">Tu espacio personal</p>
          <h1 className="m-0 text-[25px] tracking-[-0.5px]">Configuración</h1>
          <p className="mb-4 mt-1 max-w-[420px] text-xs leading-[1.5] text-[var(--ry-muted)]">Administra tu cuenta y personaliza tu experiencia en la plataforma.</p>
        </div>
        <button aria-expanded={expandedItem === 'profile'} className="flex min-h-[90px] w-full items-center gap-[13px] rounded-[15px] border border-[#dfe9f4] bg-gradient-to-r from-[#f8fbff] to-white p-[13px] text-left text-[var(--ry-ink)] dark:border-[var(--ry-card-border)] dark:from-[var(--ry-surface)] dark:to-[var(--ry-surface)]" onClick={() => setExpandedItem(expandedItem === 'profile' ? null : 'profile')} type="button">
          <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[#e8f2ff] text-base font-bold text-[var(--ry-blue)] dark:bg-[#223852]">{student.name.slice(0, 1).toUpperCase()}{student.name.split(' ')[1]?.slice(0, 1).toUpperCase() ?? ''}</span>
          <span className="grid min-w-0 flex-1 gap-1"><strong className="text-[13px]">{student.name}</strong><small className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--ry-muted)]">{student.email}</small><span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#e8f2ff] px-[7px] py-[3px] text-[9px] font-bold text-[var(--ry-blue)] dark:bg-[#223852]"><Icon name="user" size={12} /> {student.role === 'administrador' ? 'Administrador' : student.role === 'mantenimiento' ? 'Mantenimiento' : 'Estudiante'}</span></span>
          <Icon className={`shrink-0 text-[#8ba3bc] transition-transform ${expandedItem === 'profile' ? 'rotate-90' : ''}`} name="chevron" size={19} />
        </button>
        {expandedItem === 'profile' && <p className="m-0 px-[13px] pb-3 pl-[53px] text-[11px] leading-[1.5] text-[var(--ry-muted)]">Número de control: {student.controlNumber || 'No proporcionado en esta demostración'}</p>}
        <div className="mt-4 grid gap-[13px]">
          {student.role === 'administrador' && (
            <section>
              <h2 className="mb-[6px] mt-0 text-[13px] text-[#244b76] dark:text-[var(--ry-muted)]">Administración</h2>
              <button className="flex min-h-14 w-full items-center gap-[10px] rounded-xl border border-[#e0e9f4] bg-white px-[11px] py-[9px] text-left text-[var(--ry-ink)] hover:border-[#bed6f1] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]" onClick={onManageUsers} type="button">
                <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#eff6ff] text-[#2781e8] dark:bg-[#223852] dark:text-[#a9ccfa]"><Icon name="user" size={19} /></span>
                <span className="grid min-w-0 flex-1 gap-1"><strong className="text-[11px]">Gestionar usuarios</strong><small className="text-[10px] leading-[1.35] text-[var(--ry-muted)]">Consulta cuentas y agrega personal de mantenimiento.</small></span>
                <Icon className="shrink-0 text-[#8ba3bc]" name="chevron" size={18} />
              </button>
            </section>
          )}
          {settingGroups.map((group) => (
            <section key={group.heading}>
              <h2 className="mb-[6px] mt-0 text-[13px] text-[#244b76] dark:text-[var(--ry-muted)]">{group.heading}</h2>
              {group.items.map((item) => {
                return (
                  <button className="mb-[6px] flex min-h-14 w-full items-center gap-[10px] rounded-xl border border-[#e0e9f4] bg-white px-[11px] py-[9px] text-left text-[var(--ry-ink)] hover:border-[#bed6f1] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]" key={item.title} onClick={item.onClick} type="button">
                    <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#eff6ff] text-[#2781e8] dark:bg-[#223852] dark:text-[#a9ccfa]"><Icon name={item.icon} size={19} /></span>
                    <span className="grid min-w-0 flex-1 gap-1"><strong className="text-[11px]">{item.title}</strong><small className="text-[10px] leading-[1.35] text-[var(--ry-muted)]">{item.description}</small></span>
                    <Icon className="shrink-0 text-[#8ba3bc]" name="chevron" size={18} />
                  </button>
                )
              })}
            </section>
          ))}
          <section>
            <h2 className="mb-[6px] mt-0 text-[13px] text-[#244b76] dark:text-[var(--ry-muted)]">Cerrar sesión</h2>
            <button className="flex min-h-14 w-full items-center gap-[10px] rounded-xl border border-[#e0e9f4] bg-white px-[11px] py-[9px] text-left text-[var(--ry-ink)] hover:border-[#bed6f1] disabled:opacity-60 dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]" disabled={loggingOut} onClick={() => void handleLogout()} type="button">
              <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#fff0f2] text-[#e94e63] dark:bg-[#422733]"><Icon name="logout" size={19} /></span>
              <span className="grid min-w-0 flex-1 gap-1"><strong className="text-[11px]">{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</strong><small className="text-[10px] leading-[1.35] text-[var(--ry-muted)]">{logoutError || 'Sal de tu cuenta de forma segura.'}</small></span>
              <Icon className="shrink-0 text-[#8ba3bc]" name="chevron" size={18} />
            </button>
          </section>
        </div>
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: student.role === 'alumno' ? 'Mis reportes' : 'Reportes', icon: 'reports', onClick: onOpenReports },
        ...(student.role === 'alumno' ? [{ label: 'Crear reporte', icon: 'plus' as const, onClick: onCreateReport }] : []),
        { label: 'Mi cuenta', icon: 'user', active: true },
      ]} />
    </div>
  )
}
