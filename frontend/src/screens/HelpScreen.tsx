import { useEffect, useState, type FormEvent } from 'react'
import { createSupportRequest, errorMessage, listSupportRequests, updateSupportRequestStatus, type SupportRequest } from '../api'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type HelpScreenProps = {
  student: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenNotifications: () => void
  onOpenReports: () => void
}

function formatDate(value: string) {
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

export function HelpScreen({ student, onBack, onOpenHome, onOpenNotifications, onOpenReports }: HelpScreenProps) {
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    void listSupportRequests().then((items) => {
      if (active) setRequests(items)
    }).catch((reason: unknown) => {
      if (active) setError(errorMessage(reason))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const request = await createSupportRequest(subject, message)
      setRequests((items) => [request, ...items])
      setSubject('')
      setMessage('')
      setSuccess('Tu solicitud quedó registrada para el equipo de administración.')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(request: SupportRequest) {
    const status = request.status === 'Abierta' ? 'Resuelta' : 'Abierta'
    setSaving(true)
    setError('')
    try {
      await updateSupportRequestStatus(request.id, status)
      setRequests((items) => items.map((item) => item.id === request.id ? { ...item, status } : item))
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ry-app-shell">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="ry-account-main">
        <button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="ry-overline">Estamos para ayudarte</p>
        <h1>Centro de ayuda</h1>
        <p className="ry-account-intro">Encuentra respuestas o envía una solicitud al equipo de ReportaYa.</p>
        <section className="ry-help-faq" aria-label="Preguntas frecuentes">
          <details>
            <summary>¿Cómo creo un reporte?</summary>
            <p>Entra a Inicio, selecciona Crear nuevo reporte, elige una categoría, agrega la ubicación y una descripción. La fotografía es opcional.</p>
          </details>
          <details>
            <summary>¿Quién puede ver mis reportes?</summary>
            <p>Tú puedes consultar tus reportes. El personal de mantenimiento y administración puede ver los reportes del plantel para atenderlos.</p>
          </details>
          <details>
            <summary>¿Cómo consulto el avance?</summary>
            <p>Abre Mis reportes y selecciona un reporte para revisar su estado y el historial de seguimiento.</p>
          </details>
          <details>
            <summary>¿Qué hago si necesito más ayuda?</summary>
            <p>Envía una solicitud desde este formulario. El equipo de administración podrá revisar y marcarla como resuelta.</p>
          </details>
        </section>
        <form className="ry-support-form" onSubmit={(event) => void handleSubmit(event)}>
          <div><h2>Enviar una solicitud</h2><p>Tu nombre y correo se adjuntan automáticamente para que el equipo pueda identificarla.</p></div>
          <label htmlFor="support-subject">Asunto</label>
          <input id="support-subject" maxLength={120} minLength={4} onChange={(event) => setSubject(event.currentTarget.value)} required value={subject} />
          <label htmlFor="support-message">¿En qué podemos ayudarte?</label>
          <textarea id="support-message" maxLength={2000} minLength={10} onChange={(event) => setMessage(event.currentTarget.value)} required rows={4} value={message} />
          {error && <p className="ry-form-message" role="alert">{error}</p>}
          {success && <p className="ry-success-message" role="status">{success}</p>}
          <button className="ry-button ry-button--primary" disabled={saving} type="submit">{saving ? 'Enviando…' : 'Enviar solicitud'}</button>
        </form>
        <section className="ry-support-requests">
          <div className="ry-account-page-heading">
            <div><h2>{student.role === 'administrador' ? 'Solicitudes recibidas' : 'Mis solicitudes'}</h2><p>{student.role === 'administrador' ? 'Revisa y actualiza las solicitudes de la comunidad.' : 'Consulta aquí el estado de tus solicitudes.'}</p></div>
            {student.role === 'administrador' && <span className="ry-role-pill"><Icon name="shield" size={12} /> Administración</span>}
          </div>
          {loading ? <p className="ry-empty-state" role="status">Cargando solicitudes…</p> : requests.length === 0 ? (
            <p className="ry-empty-state">Todavía no hay solicitudes.</p>
          ) : (
            <div className="ry-support-list">
              {requests.map((request) => (
                <article className="ry-support-card" key={request.id}>
                  <div className="ry-support-card-heading"><strong>{request.subject}</strong><span className={`ry-support-status${request.status === 'Resuelta' ? ' is-resolved' : ''}`}>{request.status}</span></div>
                  {student.role === 'administrador' && <small>{request.requesterName} · {request.requesterEmail}</small>}
                  <p>{request.message}</p>
                  <div className="ry-support-card-footer">
                    <small>{formatDate(request.createdAt)}</small>
                    {student.role === 'administrador' && <button className="ry-text-button" disabled={saving} onClick={() => void handleStatusChange(request)} type="button">{request.status === 'Abierta' ? 'Marcar resuelta' : 'Reabrir'}</button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Reportes</span></button>
        <button aria-current="page" className="is-active" onClick={onBack} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
