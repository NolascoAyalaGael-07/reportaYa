import { useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Brand'
import type { IconName } from '../components/Brand'
import { StatusBadge } from '../components/StatusBadge'
import type { Report, ReportStatus, Student } from './reportTypes'

type HomeScreenProps = {
  student: Student
  reports: Report[]
  showReports: boolean
  onCreateReport: () => void
  onOpenSettings: () => void
  onOpenReports: () => void
  onOpenHome: () => void
  onOpenReport: (reportId: string) => void
  onOpenNotifications: () => void
}

const reportIcon: Record<string, IconName> = {
  Electricidad: 'lightbulb',
  Plomería: 'drop',
  Limpieza: 'trash',
}

const reportStatuses: Array<'Todos' | ReportStatus> = [
  'Todos',
  'Pendiente',
  'En atención',
  'Solucionado',
]

const roleLabels: Record<Student['role'], string> = {
  alumno: 'Estudiante',
  mantenimiento: 'Mantenimiento',
  administrador: 'Administración',
}

function ReportCard({
  report,
  role,
  onOpenReport,
}: {
  report: Report
  role: Student['role']
  onOpenReport: (reportId: string) => void
}) {
  const reportDate = new Date(`${report.date}T00:00:00`)
  const formattedDate = Number.isNaN(reportDate.getTime())
    ? report.date
    : reportDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })

  return (
    <article className="flex min-w-0 items-center gap-[10px] rounded-[13px] border border-[#e0e8f1] bg-white p-[13px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]">
      <button className="flex w-full min-w-0 items-center gap-[10px] border-0 bg-transparent p-0 text-inherit text-left" onClick={() => onOpenReport(report.id)} type="button">
        <span className="grid size-[37px] shrink-0 place-items-center rounded-[11px] bg-[#eff6ff] text-[#2781e8] dark:bg-[#223852] dark:text-[#a9ccfa]"><Icon name={reportIcon[report.category] ?? 'reports'} size={19} /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="grid min-w-0 gap-[3px]">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[var(--ry-ink)]">{report.title}</strong>
              <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--ry-muted)]">{report.location}</small>
            </span>
            <Icon className="shrink-0 text-[#96a9bf]" name="chevron" size={18} />
          </span>
          <span className="mt-[9px] flex items-center justify-between gap-2 text-[10px] text-[#8294aa]"><span>{report.category} · {formattedDate}{report.photoUrl ? ' · Foto' : ''}</span><StatusBadge status={report.status} /></span>
          {role !== 'alumno' && <span className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[#607995] dark:text-[var(--ry-muted)]">Reportado por {report.reporterName} · {report.reporterControlNumber}</span>}
        </span>
      </button>
    </article>
  )
}

export function HomeScreen({
  student,
  reports,
  showReports,
  onCreateReport,
  onOpenSettings,
  onOpenReports,
  onOpenHome,
  onOpenReport,
  onOpenNotifications,
}: HomeScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | ReportStatus>('Todos')
  const [query, setQuery] = useState('')
  const isStudent = student.role === 'alumno'
  const count = (status: ReportStatus) => reports.filter((report) => report.status === status).length
  const visibleReports = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('es-MX')
    return reports.filter((report) => {
      const matchesStatus = selectedStatus === 'Todos' || report.status === selectedStatus
      const searchableText = `${report.title} ${report.description} ${report.location} ${report.category} ${report.reporterName} ${report.reporterControlNumber}`.toLocaleLowerCase('es-MX')
      return matchesStatus && (!search || searchableText.includes(search))
    })
  }, [query, reports, selectedStatus])

  return (
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[900px] pt-6 min-[760px]:pt-[34px] max-[430px]:pt-5">
        {showReports ? (
          <section aria-labelledby="reports-title">
            <div className="flex items-center justify-between gap-3">
              <div><p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">{roleLabels[student.role]}</p><h1 className="m-0 text-[26px] tracking-[-0.5px]" id="reports-title">{isStudent ? 'Mis reportes' : 'Bandeja de reportes'}</h1></div>
              {isStudent && <button className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[11px] bg-[var(--ry-blue)] px-[11px] py-2 text-[11px] font-bold text-white" onClick={onCreateReport} type="button"><Icon name="plus" size={17} /> Nuevo reporte</button>}
            </div>
            <p className="mt-1 text-xs text-[var(--ry-muted)]">{isStudent ? 'Da seguimiento a los reportes que has compartido.' : 'Consulta los incidentes y actualiza su estado.'}</p>
          </section>
        ) : (
          <>
            <section>
              <p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">{roleLabels[student.role]} · Instituto Tecnológico de Tijuana</p>
              <h1 className="m-0 text-[26px] tracking-[-0.5px]">Hola, {student.name.split(' ')[0]}</h1>
              <p className="mt-1 text-xs text-[var(--ry-muted)]">{isStudent ? 'Hagamos de nuestra escuela un mejor lugar.' : 'Aquí están los reportes que requieren seguimiento.'}</p>
            </section>
            {isStudent && (
              <button className="mt-[17px] flex min-h-24 w-full items-center justify-between rounded-2xl border-0 bg-gradient-to-r from-[#0b69d4] to-[#075abf] px-[18px] py-4 text-left text-white shadow-[0_8px_18px_#0b69d41c] min-[760px]:min-h-28 max-[430px]:[&>span:first-child>strong]:text-base" onClick={onCreateReport} type="button">
                <span className="grid gap-[5px]"><strong className="text-[17px]">Crear nuevo reporte</strong><span className="text-xs text-[#deedff]">¿Algo necesita atención? Cuéntanos.</span><small className="mt-0.5 inline-flex items-center gap-[5px] text-[10px] text-[#d3e6ff]"><Icon name="camera" size={14} /> Categoría · descripción · foto · ubicación</small></span>
                <span className="grid size-10 place-items-center rounded-xl bg-white text-[var(--ry-blue)]"><Icon name="plus" size={23} /></span>
              </button>
            )}
            <section aria-label="Resumen de reportes" className="mt-4 grid grid-cols-3 gap-[10px]">
              <div className="grid min-h-[68px] content-center gap-[3px] rounded-xl border border-[#e0e8f1] bg-white px-3 py-[10px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]"><strong className="text-xl leading-none">{count('Pendiente')}</strong><span className="inline-flex items-center gap-[5px] text-[10px] text-[#7790aa]"><i className="size-[7px] rounded-full bg-[#f49b4a]" />Pendiente</span></div>
              <div className="grid min-h-[68px] content-center gap-[3px] rounded-xl border border-[#e0e8f1] bg-white px-3 py-[10px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]"><strong className="text-xl leading-none">{count('En atención')}</strong><span className="inline-flex items-center gap-[5px] text-[10px] text-[#7790aa]"><i className="size-[7px] rounded-full bg-[#1672d9]" />En atención</span></div>
              <div className="grid min-h-[68px] content-center gap-[3px] rounded-xl border border-[#e0e8f1] bg-white px-3 py-[10px] dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]"><strong className="text-xl leading-none">{count('Solucionado')}</strong><span className="inline-flex items-center gap-[5px] text-[10px] text-[#7790aa]"><i className="size-[7px] rounded-full bg-[#399c87]" />Solucionado</span></div>
            </section>
          </>
        )}
        <section aria-labelledby="recent-reports-title" className="mt-[23px]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-[17px] tracking-[-0.2px]" id="recent-reports-title">{isStudent ? 'Mis reportes' : 'Todos los reportes'}</h2>
            {!showReports && <button className="cursor-pointer border-0 bg-transparent p-1 text-[11px] text-[#8294aa]" onClick={onOpenReports} type="button">{reports.length} en total</button>}
          </div>
          {showReports && (
            <div className="mt-[14px] grid gap-[9px]">
              <label className="flex min-h-[42px] items-center gap-2 rounded-[10px] border border-[var(--ry-line)] bg-white px-[11px] text-[#8ca1b8] dark:bg-[var(--ry-surface)]"><Icon name="search" size={18} /><input aria-label="Buscar reportes" className="min-w-0 flex-1 bg-transparent py-[9px] text-[11px] text-[var(--ry-ink)] outline-none placeholder:text-[#99aabe]" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Buscar descripción, lugar o alumno" value={query} /></label>
              <div aria-label="Filtrar por estado" className="flex gap-1.5 overflow-x-auto pb-0.5">
                {reportStatuses.map((status) => (
                  <button aria-pressed={selectedStatus === status} className={`shrink-0 rounded-full border border-[var(--ry-line)] px-[10px] py-[7px] text-[10px] ${selectedStatus === status ? 'border-[var(--ry-blue)] bg-[var(--ry-blue)] text-white' : 'bg-white text-[#70849b] dark:bg-[var(--ry-surface)] dark:text-[var(--ry-muted)]'}`} key={status} onClick={() => setSelectedStatus(status)} type="button">{status}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-[11px] grid gap-[9px] min-[760px]:gap-[11px]">
            {visibleReports.length > 0
              ? visibleReports.map((report) => <ReportCard key={report.id} onOpenReport={onOpenReport} report={report} role={student.role} />)
              : <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]">{reports.length === 0 ? 'Todavía no tienes reportes. Cuando compartas uno, aparecerá aquí.' : 'No encontramos reportes con esos filtros.'}</p>}
          </div>
        </section>
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome, active: !showReports },
        { label: isStudent ? 'Mis reportes' : 'Reportes', icon: 'reports', onClick: onOpenReports, active: showReports },
        { label: 'Mi cuenta', icon: 'user', onClick: onOpenSettings },
      ]} />
    </div>
  )
}
