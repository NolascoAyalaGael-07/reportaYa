import { FormEvent, useEffect, useState } from 'react'
import { changeReportStatus, errorMessage, getReport, getReportHistory, type StatusHistoryEntry } from '../api'
import { Brand, Icon } from '../components/Brand'
import type { Report, ReportStatus, Student } from './reportTypes'

type ReportDetailScreenProps = {
  reportId: string
  student: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenReports: () => void
  onOpenSettings: () => void
  onUpdated: (report: Report) => void
}

const statuses: ReportStatus[] = ['Pendiente', 'En atención', 'Solucionado']

function formatDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: value.includes(':') ? 'short' : undefined })
}

function historyTitle(entry: StatusHistoryEntry) {
  return entry.fromStatus
    ? `${entry.fromStatus} → ${entry.toStatus}`
    : `Reporte creado · ${entry.toStatus}`
}

export function ReportDetailScreen({
  reportId,
  student,
  onBack,
  onOpenHome,
  onOpenReports,
  onOpenSettings,
  onUpdated,
}: ReportDetailScreenProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [history, setHistory] = useState<StatusHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [nextStatus, setNextStatus] = useState<ReportStatus>('En atención')
  const [comment, setComment] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    void Promise.all([getReport(reportId), getReportHistory(reportId)]).then(([details, entries]) => {
      if (active) {
        setReport(details)
        setNextStatus(details.status === 'Pendiente' ? 'En atención' : details.status === 'En atención' ? 'Solucionado' : 'Pendiente')
        setHistory(entries)
      }
    }).catch((reason: unknown) => {
      if (active) setError(errorMessage(reason))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [reportId])

  async function handleStatusSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!report) return
    setSaving(true)
    setError('')
    try {
      const updated = await changeReportStatus(report.id, nextStatus, comment)
      const updatedHistory = await getReportHistory(report.id)
      setReport(updated)
      setHistory(updatedHistory)
      setComment('')
      setNextStatus(updated.status === 'Pendiente' ? 'En atención' : updated.status === 'En atención' ? 'Solucionado' : 'Pendiente')
      onUpdated(updated)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ry-app-shell">
      <header className="ry-app-header">
        <div className="ry-app-header-inner">
          <Brand />
          <span aria-label="Sesión activa" className="ry-avatar ry-avatar--small">{student.name.slice(0, 1).toUpperCase()}{student.name.split(' ')[1]?.slice(0, 1).toUpperCase() ?? ''}</span>
        </div>
      </header>
      <main className="ry-report-detail-main">
        <button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Regresar a reportes</button>
        {loading ? (
          <p className="ry-empty-state" role="status">Cargando detalle del reporte…</p>
        ) : error && !report ? (
          <p className="ry-error-panel" role="alert">{error}</p>
        ) : report ? (
          <>
            <header className="ry-detail-heading">
              <p className="ry-overline">{report.category} · Reporte #{report.id}</p>
              <h1>{report.title}</h1>
              <div className="ry-detail-status-row"><StatusBadge status={report.status} /><span>{formatDate(report.date)}</span></div>
            </header>
            <div className="ry-detail-grid">
              <div className="ry-detail-primary">
                <section className="ry-detail-card">
                  <h2>Descripción del problema</h2>
                  <p className="ry-detail-description">{report.description}</p>
                  <div className="ry-detail-location"><Icon name="pin" size={18} /><span><strong>Ubicación</strong><small>{report.location}</small></span></div>
                  {student.role !== 'alumno' && <div className="ry-detail-reporter"><Icon name="user" size={18} /><span><strong>Reportado por</strong><small>{report.reporterName} · {report.reporterControlNumber}</small></span></div>}
                </section>
                {report.photoUrl && (
                  <section className="ry-detail-card ry-detail-photo-section">
                    <h2>Fotografía del incidente</h2>
                    <img alt={`Fotografía del reporte: ${report.title}`} className="ry-detail-photo" src={report.photoUrl} />
                  </section>
                )}
              </div>
              <aside className="ry-detail-secondary">
                {student.role !== 'alumno' && (
                  <form className="ry-detail-card ry-status-update-form" onSubmit={handleStatusSubmit}>
                    <h2>Actualizar estado</h2>
                    <label htmlFor="detail-status">Nuevo estado</label>
                    <select id="detail-status" onChange={(event) => setNextStatus(event.currentTarget.value as ReportStatus)} value={nextStatus}>
                      {statuses.filter((status) => status !== report.status).map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <label htmlFor="detail-comment">Nota del personal (opcional)</label>
                    <textarea id="detail-comment" maxLength={300} onChange={(event) => setComment(event.currentTarget.value)} placeholder="Describe brevemente el avance del trabajo." rows={3} value={comment} />
                    {error && <p className="ry-form-message" role="alert">{error}</p>}
                    <button className="ry-button ry-button--primary" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar estado'}</button>
                  </form>
                )}
                <section className="ry-detail-card ry-timeline-card">
                  <h2>Historial de seguimiento</h2>
                  {history.length === 0 ? <p className="ry-timeline-empty">Aún no hay actualizaciones.</p> : (
                    <ol className="ry-timeline">
                      {history.map((entry) => (
                        <li key={entry.id}>
                          <span className="ry-timeline-marker" />
                          <strong>{historyTitle(entry)}</strong>
                          <small>{formatDate(entry.changedAt)} · {entry.changedBy}</small>
                          {entry.comment && <p>{entry.comment}</p>}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button aria-current="page" className="is-active" onClick={onOpenReports} type="button"><Icon name="reports" /><span>Reportes</span></button>
        <button onClick={onOpenSettings} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const icon = status === 'Solucionado' ? 'check' : status === 'En atención' ? 'settings' : 'clock'

  return <span className={`ry-status ry-status--${status.replace(' ', '-').toLowerCase()}`}><Icon name={icon} size={12} />{status}</span>
}
