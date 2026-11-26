import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
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
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[860px] py-6 pb-[42px]">
        <button className="mb-[18px] inline-flex items-center gap-[7px] border-0 bg-transparent py-1.5 text-xs font-bold text-[var(--ry-blue)]" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">Tus datos y reportes</p>
        <h1 className="m-0 text-[27px] tracking-[-0.7px]">Privacidad</h1>
        <p className="mb-5 mt-[6px] text-xs leading-[1.55] text-[var(--ry-muted)]">La plataforma aplica estos controles en cada consulta al servidor.</p>
        <section className="mt-[10px] flex items-start gap-[13px] rounded-[14px] border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#eff6ff] text-[#2781e8] dark:bg-[#223852] dark:text-[#a9ccfa]"><Icon name="shield" size={22} /></span>
          <div><h2 className="mb-[5px] mt-0 text-[13px]">Acceso a tus reportes</h2><p className="m-0 text-[11px] leading-[1.6] text-[var(--ry-muted)]">{visibility}</p></div>
        </section>
        <section className="mt-[10px] flex items-start gap-[13px] rounded-[14px] border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#eff6ff] text-[#2781e8] dark:bg-[#223852] dark:text-[#a9ccfa]"><Icon name="lock" size={22} /></span>
          <div><h2 className="mb-[5px] mt-0 text-[13px]">Contraseña</h2><p className="m-0 text-[11px] leading-[1.6] text-[var(--ry-muted)]">Tu contraseña se guarda como hash y nunca se muestra en tu perfil ni en la lista de usuarios.</p></div>
        </section>
        <section className="mt-[10px] flex items-start gap-[13px] rounded-[14px] border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#eff6ff] text-[#2781e8] dark:bg-[#223852] dark:text-[#a9ccfa]"><Icon name="user" size={22} /></span>
          <div><h2 className="mb-[5px] mt-0 text-[13px]">Correo y número de control</h2><p className="m-0 text-[11px] leading-[1.6] text-[var(--ry-muted)]">Estos datos identifican tu cuenta y no se pueden editar desde la aplicación.</p></div>
        </section>
        <p className="mt-[13px] text-[11px] leading-[1.6] text-[var(--ry-muted)]">La visibilidad de los reportes es una regla de seguridad del sistema y no puede desactivarse desde la cuenta.</p>
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: 'Reportes', icon: 'reports', onClick: onOpenReports },
        { label: 'Mi cuenta', icon: 'user', onClick: onBack, active: true },
      ]} />
    </div>
  )
}
