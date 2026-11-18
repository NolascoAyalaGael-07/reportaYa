import { useState, type FormEvent } from 'react'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type AccountSettingsScreenProps = {
  student: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenNotifications: () => void
  onOpenReports: () => void
  onSave: (input: { name: string; currentPassword?: string; newPassword?: string }) => Promise<void>
}

export function AccountSettingsScreen({
  student,
  onBack,
  onOpenHome,
  onOpenNotifications,
  onOpenReports,
  onSave,
}: AccountSettingsScreenProps) {
  const [name, setName] = useState(student.name)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (newPassword && !currentPassword) {
      setError('Escribe tu contraseña actual para poder cambiarla.')
      return
    }
    if (newPassword && newPassword !== confirmation) {
      setError('La nueva contraseña y su confirmación no coinciden.')
      return
    }
    if (!newPassword && (currentPassword || confirmation)) {
      setError('Para cambiar la contraseña, completa los tres campos de contraseña.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        ...(newPassword ? { currentPassword, newPassword } : {}),
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmation('')
      setMessage('Los datos de tu cuenta se actualizaron.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[860px] py-6 pb-[42px]">
        <button className="mb-[18px] inline-flex items-center gap-[7px] border-0 bg-transparent py-1.5 text-xs font-bold text-[var(--ry-blue)]" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">Tu perfil</p>
        <h1 className="m-0 text-[27px] tracking-[-0.7px]">Datos de la cuenta</h1>
        <p className="mb-5 mt-[6px] text-xs leading-[1.55] text-[var(--ry-muted)]">Actualiza tu nombre o cambia la contraseña de acceso.</p>
        <form className="grid gap-[9px] rounded-2xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-5 shadow-[0_10px_28px_#18335408]" onSubmit={handleSubmit}>
          <label className="mt-1.5 text-[11px] font-bold" htmlFor="account-name">Nombre completo</label>
          <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="name" id="account-name" maxLength={150} minLength={2} onChange={(event) => setName(event.currentTarget.value)} required value={name} />
          <label className="mt-1.5 text-[11px] font-bold" htmlFor="account-email">Correo electrónico</label>
          <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-background)] px-3 py-[10px] text-xs text-[var(--ry-muted)]" id="account-email" readOnly value={student.email} />
          <small className="-mt-[5px] text-[10px] text-[var(--ry-muted)]">El correo no se puede cambiar desde la aplicación.</small>
          <label className="mt-1.5 text-[11px] font-bold" htmlFor="account-control">Número de control</label>
          <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-background)] px-3 py-[10px] text-xs text-[var(--ry-muted)]" id="account-control" readOnly value={student.controlNumber} />
          <small className="-mt-[5px] text-[10px] text-[var(--ry-muted)]">El número de control no se puede cambiar desde la aplicación.</small>
          <div className="mt-[10px] grid gap-[9px] border-t border-[var(--ry-line)] pt-4">
            <h2 className="m-0 text-[15px]">Cambiar contraseña</h2>
            <p className="-mt-1 mb-[3px] text-[11px] text-[var(--ry-muted)]">Deja estos campos vacíos si no necesitas cambiarla.</p>
            <label className="mt-1.5 text-[11px] font-bold" htmlFor="account-current-password">Contraseña actual</label>
            <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="current-password" id="account-current-password" onChange={(event) => setCurrentPassword(event.currentTarget.value)} type="password" value={currentPassword} />
            <label className="mt-1.5 text-[11px] font-bold" htmlFor="account-new-password">Nueva contraseña</label>
            <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="new-password" id="account-new-password" minLength={8} onChange={(event) => setNewPassword(event.currentTarget.value)} type="password" value={newPassword} />
            <small className="-mt-[5px] text-[10px] text-[var(--ry-muted)]">Usa entre 8 y 128 caracteres.</small>
            <label className="mt-1.5 text-[11px] font-bold" htmlFor="account-confirm-password">Confirmar nueva contraseña</label>
            <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="new-password" id="account-confirm-password" onChange={(event) => setConfirmation(event.currentTarget.value)} type="password" value={confirmation} />
          </div>
          {error && <p className="m-0 rounded-[10px] border border-[#f1c7c7] bg-[#fff4f4] p-[10px] text-[11px] text-[#b42318] dark:border-[#613842] dark:bg-[#30202a] dark:text-[#ffaaaa]" role="alert">{error}</p>}
          {message && <p className="m-0 rounded-[10px] border border-[#cceadd] bg-[#f0fbf5] p-[10px] text-[11px] text-[#19745d] dark:border-[#285746] dark:bg-[#1b352e] dark:text-[#a0dfc7]" role="status">{message}</p>}
          <button className="mt-1.5 min-h-11 rounded-[11px] bg-[var(--ry-blue)] px-3 text-xs font-bold text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: 'Reportes', icon: 'reports', onClick: onOpenReports },
        { label: 'Mi cuenta', icon: 'user', onClick: onBack, active: true },
      ]} />
    </div>
  )
}
