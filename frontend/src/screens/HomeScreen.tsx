import { useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Brand'
import type { IconName } from '../components/Brand'
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
    <article className="ry-report-card">
      <button className="ry-report-open" onClick={() => onOpenReport(report.id)} type="button">
        <span className="ry-report-icon"><Icon name={reportIcon[report.category] ?? 'reports'} size={19} /></span>
        <span className="ry-report-details">
          <span className="ry-report-heading">
            <span className="ry-report-title-group">
              <strong>{report.title}</strong>
              <small>{report.location}</small>
            </span>
            <Icon name="chevron" size={18} />
          </span>
          <span className="ry-report-meta"><span>{report.category} · {formattedDate}{report.photoUrl ? ' · Foto' : ''}</span><StatusBadge status={report.status} /></span>
          {role !== 'alumno' && <span className="ry-report-reporter">Reportado por {report.reporterName} · {report.reporterControlNumber}</span>}
        </span>
      </button>
    </article>
  )
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const icon = status === 'Solucionado' ? 'check' : status === 'En atención' ? 'settings' : 'clock'

  return <span className={`ry-status ry-status--${status.replace(' ', '-').toLowerCase()}`}><Icon name={icon} size={12} />{status}</span>
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
    <div className="ry-app-shell">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="ry-home-main">
        {showReports ? (
          <section aria-labelledby="reports-title">
            <div className="ry-section-title-row">
              <div><p className="ry-overline">{roleLabels[student.role]}</p><h1 id="reports-title">{isStudent ? 'Mis reportes' : 'Bandeja de reportes'}</h1></div>
              {isStudent && <button className="ry-button ry-button--primary ry-new-report-compact" onClick={onCreateReport} type="button"><Icon name="plus" size={17} /> Nuevo reporte</button>}
            </div>
            <p className="ry-home-subtitle">{isStudent ? 'Da seguimiento a los reportes que has compartido.' : 'Consulta los incidentes y actualiza su estado.'}</p>
          </section>
        ) : (
          <>
            <section className="ry-greeting">
              <p className="ry-overline">{roleLabels[student.role]} · Instituto Tecnológico de Tijuana</p>
              <h1>Hola, {student.name.split(' ')[0]}</h1>
              <p>{isStudent ? 'Hagamos de nuestra escuela un mejor lugar.' : 'Aquí están los reportes que requieren seguimiento.'}</p>
            </section>
            {isStudent && (
              <button className="ry-create-banner" onClick={onCreateReport} type="button">
                <span className="ry-create-banner-copy"><strong>Crear nuevo reporte</strong><span>¿Algo necesita atención? Cuéntanos.</span><small><Icon name="camera" size={14} /> Categoría · descripción · foto · ubicación</small></span>
                <span className="ry-create-plus"><Icon name="plus" size={23} /></span>
              </button>
            )}
            <section aria-label="Resumen de reportes" className="ry-stat-grid">
              <div className="ry-stat-card"><strong>{count('Pendiente')}</strong><span><i className="ry-dot ry-dot--pending" />Pendiente</span></div>
              <div className="ry-stat-card"><strong>{count('En atención')}</strong><span><i className="ry-dot ry-dot--progress" />En atención</span></div>
              <div className="ry-stat-card"><strong>{count('Solucionado')}</strong><span><i className="ry-dot ry-dot--resolved" />Solucionado</span></div>
            </section>
          </>
        )}
        <section className="ry-report-list-section" aria-labelledby="recent-reports-title">
          <div className="ry-section-title-row">
            <h2 id="recent-reports-title">{isStudent ? 'Mis reportes' : 'Todos los reportes'}</h2>
            {!showReports && <button className="ry-text-button" onClick={onOpenReports} type="button">{reports.length} en total</button>}
          </div>
          {showReports && (
            <div className="ry-report-filters">
              <label className="ry-search-field"><Icon name="search" size={18} /><input aria-label="Buscar reportes" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Buscar descripción, lugar o alumno" value={query} /></label>
              <div aria-label="Filtrar por estado" className="ry-status-filters">
                {reportStatuses.map((status) => (
                  <button aria-pressed={selectedStatus === status} className={selectedStatus === status ? 'is-selected' : ''} key={status} onClick={() => setSelectedStatus(status)} type="button">{status}</button>
                ))}
              </div>
            </div>
          )}
          <div className="ry-report-list">
            {visibleReports.length > 0
              ? visibleReports.map((report) => <ReportCard key={report.id} onOpenReport={onOpenReport} report={report} role={student.role} />)
              : <p className="ry-empty-state">{reports.length === 0 ? 'Todavía no tienes reportes. Cuando compartas uno, aparecerá aquí.' : 'No encontramos reportes con esos filtros.'}</p>}
          </div>
        </section>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button aria-current={!showReports ? 'page' : undefined} className={!showReports ? 'is-active' : ''} onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button aria-current={showReports ? 'page' : undefined} className={showReports ? 'is-active' : ''} onClick={onOpenReports} type="button"><Icon name="reports" /><span>{isStudent ? 'Mis reportes' : 'Reportes'}</span></button>
        <button onClick={onOpenSettings} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
