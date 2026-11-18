import { useState, type FormEvent } from 'react'
import { AppHeader } from '../components/AppHeader'
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
    <div className="ry-app-shell">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="ry-account-main">
        <button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="ry-overline">Tu perfil</p>
        <h1>Datos de la cuenta</h1>
        <p className="ry-account-intro">Actualiza tu nombre o cambia la contraseña de acceso.</p>
        <form className="ry-account-form" onSubmit={handleSubmit}>
          <label htmlFor="account-name">Nombre completo</label>
          <input autoComplete="name" id="account-name" maxLength={150} minLength={2} onChange={(event) => setName(event.currentTarget.value)} required value={name} />
          <label htmlFor="account-email">Correo electrónico</label>
          <input id="account-email" readOnly value={student.email} />
          <small>El correo no se puede cambiar desde la aplicación.</small>
          <label htmlFor="account-control">Número de control</label>
          <input id="account-control" readOnly value={student.controlNumber} />
          <small>El número de control no se puede cambiar desde la aplicación.</small>
          <div className="ry-password-section">
            <h2>Cambiar contraseña</h2>
            <p>Deja estos campos vacíos si no necesitas cambiarla.</p>
            <label htmlFor="account-current-password">Contraseña actual</label>
            <input autoComplete="current-password" id="account-current-password" onChange={(event) => setCurrentPassword(event.currentTarget.value)} type="password" value={currentPassword} />
            <label htmlFor="account-new-password">Nueva contraseña</label>
            <input autoComplete="new-password" id="account-new-password" minLength={8} onChange={(event) => setNewPassword(event.currentTarget.value)} type="password" value={newPassword} />
            <small>Usa entre 8 y 128 caracteres.</small>
            <label htmlFor="account-confirm-password">Confirmar nueva contraseña</label>
            <input autoComplete="new-password" id="account-confirm-password" onChange={(event) => setConfirmation(event.currentTarget.value)} type="password" value={confirmation} />
          </div>
          {error && <p className="ry-form-message" role="alert">{error}</p>}
          {message && <p className="ry-success-message" role="status">{message}</p>}
          <button className="ry-button ry-button--primary" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Reportes</span></button>
        <button aria-current="page" className="is-active" onClick={onBack} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
