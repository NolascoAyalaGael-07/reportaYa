import { useEffect, useState, type FormEvent } from 'react'
import { createSupportRequest, errorMessage, listSupportRequests, updateSupportRequestStatus, type SupportRequest } from '../api'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
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
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[860px] py-6 pb-[42px]">
        <button className="mb-[18px] inline-flex items-center gap-[7px] border-0 bg-transparent py-1.5 text-xs font-bold text-[var(--ry-blue)]" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">Estamos para ayudarte</p>
        <h1 className="m-0 text-[27px] tracking-[-0.7px]">Centro de ayuda</h1>
        <p className="mb-5 mt-[6px] text-xs leading-[1.55] text-[var(--ry-muted)]">Encuentra respuestas o envía una solicitud al equipo de ReportaYa.</p>
        <section aria-label="Preguntas frecuentes" className="grid gap-2">
          <details className="rounded-xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] px-[15px] py-[13px]">
            <summary>¿Cómo creo un reporte?</summary>
            <p>Entra a Inicio, selecciona Crear nuevo reporte, elige una categoría, agrega la ubicación y una descripción. La fotografía es opcional.</p>
          </details>
          <details className="rounded-xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] px-[15px] py-[13px]">
            <summary>¿Quién puede ver mis reportes?</summary>
            <p>Tú puedes consultar tus reportes. El personal de mantenimiento y administración puede ver los reportes del plantel para atenderlos.</p>
          </details>
          <details className="rounded-xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] px-[15px] py-[13px]">
            <summary>¿Cómo consulto el avance?</summary>
            <p>Abre Mis reportes y selecciona un reporte para revisar su estado y el historial de seguimiento.</p>
          </details>
          <details className="rounded-xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] px-[15px] py-[13px]">
            <summary>¿Qué hago si necesito más ayuda?</summary>
            <p>Envía una solicitud desde este formulario. El equipo de administración podrá revisar y marcarla como resuelta.</p>
          </details>
        </section>
        <form className="mt-4 grid gap-2 rounded-[14px] border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-4" onSubmit={(event) => void handleSubmit(event)}>
          <div><h2 className="m-0 text-[15px]">Enviar una solicitud</h2><p className="mb-2 mt-1 text-[10px] leading-[1.5] text-[var(--ry-muted)]">Tu nombre y correo se adjuntan automáticamente para que el equipo pueda identificarla.</p></div>
          <label className="mt-[5px] text-[11px] font-bold" htmlFor="support-subject">Asunto</label>
          <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" id="support-subject" maxLength={120} minLength={4} onChange={(event) => setSubject(event.currentTarget.value)} required value={subject} />
          <label className="mt-[5px] text-[11px] font-bold" htmlFor="support-message">¿En qué podemos ayudarte?</label>
          <textarea className="min-h-[100px] w-full resize-y rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs leading-[1.5] text-[var(--ry-ink)]" id="support-message" maxLength={2000} minLength={10} onChange={(event) => setMessage(event.currentTarget.value)} required rows={4} value={message} />
          {error && <p className="m-0 rounded-[10px] border border-[#f1c7c7] bg-[#fff4f4] p-[10px] text-[11px] text-[#b42318] dark:border-[#613842] dark:bg-[#30202a] dark:text-[#ffaaaa]" role="alert">{error}</p>}
          {success && <p className="m-0 rounded-[10px] border border-[#cceadd] bg-[#f0fbf5] p-[10px] text-[11px] text-[#19745d] dark:border-[#285746] dark:bg-[#1b352e] dark:text-[#a0dfc7]" role="status">{success}</p>}
          <button className="mt-1 min-h-11 rounded-[11px] bg-[var(--ry-blue)] px-3 text-xs font-bold text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Enviando…' : 'Enviar solicitud'}</button>
        </form>
        <section className="mt-[22px] grid gap-[10px]">
          <div className="flex items-end justify-between gap-[14px]">
            <div><h2 className="m-0 text-[17px]">{student.role === 'administrador' ? 'Solicitudes recibidas' : 'Mis solicitudes'}</h2><p className="mt-1 text-[11px] text-[var(--ry-muted)]">{student.role === 'administrador' ? 'Revisa y actualiza las solicitudes de la comunidad.' : 'Consulta aquí el estado de tus solicitudes.'}</p></div>
            {student.role === 'administrador' && <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#e8f2ff] px-[7px] py-[3px] text-[9px] font-bold text-[var(--ry-blue)] dark:bg-[#223852]"><Icon name="shield" size={12} /> Administración</span>}
          </div>
          {loading ? <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]" role="status">Cargando solicitudes…</p> : requests.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]">Todavía no hay solicitudes.</p>
          ) : (
            <div className="grid gap-[10px]">
              {requests.map((request) => (
                <article className="rounded-xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-[14px]" key={request.id}>
                  <div className="flex items-center justify-between gap-[10px]"><strong className="text-xs">{request.subject}</strong><span className={`rounded-full px-2 py-[5px] text-[9px] font-bold ${request.status === 'Resuelta' ? 'bg-[#e8f6f1] text-[#237b66] dark:bg-[#1c403b] dark:text-[#91d6bf]' : 'bg-[#fff3df] text-[#ac6b23] dark:bg-[#473724] dark:text-[#f3c27b]'}`}>{request.status}</span></div>
                  {student.role === 'administrador' && <small className="text-[9px] text-[var(--ry-muted)]">{request.requesterName} · {request.requesterEmail}</small>}
                  <p className="my-[9px] mb-3 text-[11px] leading-[1.5] text-[var(--ry-muted)]">{request.message}</p>
                  <div className="flex items-center justify-between gap-[10px]"><small className="text-[9px] text-[var(--ry-muted)]">{formatDate(request.createdAt)}</small>
                    {student.role === 'administrador' && <button className="border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--ry-blue)] disabled:opacity-60" disabled={saving} onClick={() => void handleStatusChange(request)} type="button">{request.status === 'Abierta' ? 'Marcar resuelta' : 'Reabrir'}</button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: 'Reportes', icon: 'reports', onClick: onOpenReports },
        { label: 'Mi cuenta', icon: 'user', onClick: onBack, active: true },
      ]} />
    </div>
  )
}
