import { FormEvent, useEffect, useState } from 'react'
import { changeReportStatus, errorMessage, getReport, getReportHistory, type StatusHistoryEntry } from '../api'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Brand'
import { StatusBadge } from '../components/StatusBadge'
import type { Report, ReportStatus, Student } from './reportTypes'

type ReportDetailScreenProps = {
  reportId: string
  student: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenNotifications: () => void
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
  onOpenNotifications,
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
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-36px)] max-w-[920px] py-5">
        <button className="mb-[18px] inline-flex items-center gap-[7px] border-0 bg-transparent py-1.5 text-xs font-bold text-[var(--ry-blue)]" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Regresar a reportes</button>
        {loading ? (
          <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]" role="status">Cargando detalle del reporte…</p>
        ) : error && !report ? (
          <p className="rounded-xl border border-[#f1c7c7] bg-[#fff4f4] p-3 text-xs text-[#b42318] dark:border-[#613842] dark:bg-[#30202a] dark:text-[#ffaaaa]" role="alert">{error}</p>
        ) : report ? (
          <>
            <header className="mb-[17px] mt-px">
              <p className="mb-[6px] text-[11px] font-semibold text-[#7690ad]">{report.category} · Reporte #{report.id}</p>
              <h1 className="m-0 text-2xl tracking-[-0.5px]">{report.title}</h1>
              <div className="mt-[9px] flex items-center gap-[10px] text-[10px] text-[var(--ry-muted)]"><StatusBadge status={report.status} /><span>{formatDate(report.date)}</span></div>
            </header>
            <div className="grid gap-[13px] min-[760px]:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
              <div className="grid content-start gap-[13px]">
                <section className="min-w-0 rounded-[13px] border border-[#e0e9f4] bg-white p-[15px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]">
                  <h2 className="mb-[11px] mt-0 text-[13px]">Descripción del problema</h2>
                  <p className="m-0 whitespace-pre-wrap text-xs leading-[1.65] text-[#506b89] dark:text-[var(--ry-muted)]">{report.description}</p>
                  <div className="mt-[14px] flex items-center gap-[9px] border-t border-[#edf1f6] pt-3 text-[var(--ry-blue)] dark:border-[var(--ry-line)]"><Icon name="pin" size={18} /><span className="grid gap-[3px]"><strong className="text-[10px] text-[var(--ry-ink)]">Ubicación</strong><small className="text-[10px] text-[var(--ry-muted)]">{report.location}</small></span></div>
                  {student.role !== 'alumno' && <div className="mt-[14px] flex items-center gap-[9px] border-t border-[#edf1f6] pt-3 text-[var(--ry-blue)] dark:border-[var(--ry-line)]"><Icon name="user" size={18} /><span className="grid gap-[3px]"><strong className="text-[10px] text-[var(--ry-ink)]">Reportado por</strong><small className="text-[10px] text-[var(--ry-muted)]">{report.reporterName} · {report.reporterControlNumber}</small></span></div>}
                </section>
                {report.photoUrl && (
                  <section className="min-w-0 rounded-[13px] border border-[#e0e9f4] bg-white p-[15px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]">
                    <h2 className="mb-[11px] mt-0 text-[13px]">Fotografía del incidente</h2>
                    <img alt={`Fotografía del reporte: ${report.title}`} className="block max-h-[460px] w-full rounded-[10px] object-contain" src={report.photoUrl} />
                  </section>
                )}
              </div>
              <aside className="grid content-start gap-[13px]">
                {report.status === 'Solucionado' && student.role !== 'administrador' ? (
                  <section className="rounded-[13px] border border-[#e0e9f4] bg-white p-[15px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]">
                    <h2 className="mb-[11px] mt-0 text-[13px]">Reporte solucionado</h2>
                    <p className="m-0 text-xs leading-[1.55] text-[var(--ry-muted)]">Este reporte está en modo de solo lectura y ya no se puede modificar.</p>
                  </section>
                ) : student.role !== 'alumno' && (
                  <form className="grid gap-[9px] rounded-[13px] border border-[#e0e9f4] bg-white p-[15px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]" onSubmit={handleStatusSubmit}>
                    <h2 className="mb-[2px] mt-0 text-[13px]">Actualizar estado</h2>
                    <label className="text-[10px] font-bold" htmlFor="detail-status">Nuevo estado</label>
                    <select className="min-h-[38px] rounded-[9px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-[10px] text-[11px] text-[var(--ry-ink)]" id="detail-status" onChange={(event) => setNextStatus(event.currentTarget.value as ReportStatus)} value={nextStatus}>
                      {statuses.filter((status) => status !== report.status).map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <label className="text-[10px] font-bold" htmlFor="detail-comment">Nota del personal (opcional)</label>
                    <textarea className="min-h-[75px] resize-y rounded-[9px] border border-[var(--ry-line)] bg-[var(--ry-surface)] p-[10px] text-[11px] leading-[1.5] text-[var(--ry-ink)] placeholder:text-[#99aabe]" id="detail-comment" maxLength={300} onChange={(event) => setComment(event.currentTarget.value)} placeholder="Describe brevemente el avance del trabajo." rows={3} value={comment} />
                    {error && <p className="m-0 rounded-[10px] border border-[#f1c7c7] bg-[#fff4f4] p-[10px] text-[11px] text-[#b42318] dark:border-[#613842] dark:bg-[#30202a] dark:text-[#ffaaaa]" role="alert">{error}</p>}
                    <button className="min-h-10 rounded-[11px] bg-[var(--ry-blue)] px-3 text-xs font-bold text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar estado'}</button>
                  </form>
                )}
                <section className="rounded-[13px] border border-[#e0e9f4] bg-white p-[15px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]">
                  <h2 className="mb-[11px] mt-0 text-[13px]">Historial de seguimiento</h2>
                  {history.length === 0 ? <p className="my-2 text-[11px] text-[var(--ry-muted)]">Aún no hay actualizaciones.</p> : (
                    <ol className="m-0 grid list-none gap-4 p-0">
                      {history.map((entry) => (
                        <li className="relative grid gap-[5px] pl-5 text-[11px] before:absolute before:bottom-[-16px] before:left-[5px] before:top-2 before:w-px before:bg-[#dce7f3] last:before:hidden dark:before:bg-[#31465b]" key={entry.id}>
                          <span className="absolute left-0 top-[3px] size-[11px] rounded-full border-2 border-white bg-[#2781e8] shadow-[0_0_0_2px_#dcecff] dark:border-[var(--ry-surface)] dark:shadow-[0_0_0_2px_#29415b]" />
                          <strong className="text-[var(--ry-ink)]">{historyTitle(entry)}</strong>
                          <small className="text-[10px] text-[var(--ry-muted)]">{formatDate(entry.changedAt)} · {entry.changedBy}</small>
                          {entry.comment && <p className="m-0 whitespace-pre-wrap leading-[1.5] text-[var(--ry-muted)]">{entry.comment}</p>}
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
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: 'Reportes', icon: 'reports', onClick: onOpenReports, active: true },
        { label: 'Mi cuenta', icon: 'user', onClick: onOpenSettings },
      ]} />
    </div>
  )
}
