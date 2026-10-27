import { Brand, Icon } from '../components/Brand'
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
}

const reportIcon: Record<string, IconName> = {
  Electricidad: 'lightbulb',
  Plomería: 'drop',
  Limpieza: 'trash',
} as const

function ReportCard({ report }: { report: Report }) {
  return (
    <article className="ry-report-card">
      <div className="ry-report-icon"><Icon name={reportIcon[report.category] ?? 'reports'} size={19} /></div>
      <div className="ry-report-details">
        <div className="ry-report-heading">
          <div>
            <h3>{report.title}</h3>
            <p>{report.location}</p>
          </div>
          <Icon name="chevron" size={18} />
        </div>
        <div className="ry-report-meta"><span>{report.category} · {report.date}</span><StatusBadge status={report.status} /></div>
      </div>
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
}: HomeScreenProps) {
  const count = (status: ReportStatus) => reports.filter((report) => report.status === status).length

  return (
    <div className="ry-app-shell">
      <header className="ry-app-header">
        <div className="ry-app-header-inner">
          <Brand />
          <button aria-label={`Abrir cuenta de ${student.name}`} className="ry-avatar ry-avatar--small" onClick={onOpenSettings} type="button">{student.name.slice(0, 1).toUpperCase()}{student.name.split(' ')[1]?.slice(0, 1).toUpperCase() ?? ''}</button>
        </div>
      </header>
      <main className="ry-home-main">
        {showReports ? (
          <section aria-labelledby="reports-title">
            <div className="ry-section-title-row">
              <div><p className="ry-overline">Tu actividad</p><h1 id="reports-title">Mis reportes</h1></div>
              <button className="ry-button ry-button--primary ry-new-report-compact" onClick={onCreateReport} type="button"><Icon name="plus" size={17} /> Nuevo reporte</button>
            </div>
            <p className="ry-home-subtitle">Consulta el estado de los reportes que has compartido.</p>
          </section>
        ) : (
          <>
            <section className="ry-greeting">
              <p className="ry-overline">Instituto Tecnológico de Tijuana</p>
              <h1>Hola, {student.name.split(' ')[0]}</h1>
              <p>Hagamos de nuestra escuela un mejor lugar.</p>
            </section>
            <button className="ry-create-banner" onClick={onCreateReport} type="button">
              <span className="ry-create-banner-copy"><strong>Crear nuevo reporte</strong><span>¿Algo necesita atención? Cuéntanos.</span><small><Icon name="camera" size={14} /> Categoría · descripción · foto · ubicación</small></span>
              <span className="ry-create-plus"><Icon name="plus" size={23} /></span>
            </button>
            <section aria-label="Resumen de reportes" className="ry-stat-grid">
              <div className="ry-stat-card"><strong>{count('Pendiente')}</strong><span><i className="ry-dot ry-dot--pending" />Pendiente</span></div>
              <div className="ry-stat-card"><strong>{count('En atención')}</strong><span><i className="ry-dot ry-dot--progress" />En atención</span></div>
              <div className="ry-stat-card"><strong>{count('Solucionado')}</strong><span><i className="ry-dot ry-dot--resolved" />Solucionado</span></div>
            </section>
          </>
        )}
        <section className="ry-report-list-section" aria-labelledby="recent-reports-title">
          <div className="ry-section-title-row">
            <h2 id="recent-reports-title">{showReports ? 'Todos tus reportes' : 'Mis reportes'}</h2>
            {!showReports && <button className="ry-text-button" onClick={onOpenReports} type="button">{reports.length} en total</button>}
          </div>
          <div className="ry-report-list">
            {reports.length > 0 ? reports.map((report) => <ReportCard key={report.id} report={report} />) : <p className="ry-empty-state">Todavía no tienes reportes. Cuando compartas uno, aparecerá aquí.</p>}
          </div>
        </section>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button aria-current={!showReports ? 'page' : undefined} className={!showReports ? 'is-active' : ''} onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button aria-current={showReports ? 'page' : undefined} className={showReports ? 'is-active' : ''} onClick={onOpenReports} type="button"><Icon name="reports" /><span>Mis reportes</span></button>
        <button onClick={onOpenSettings} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
