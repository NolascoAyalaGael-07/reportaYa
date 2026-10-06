import { FormEvent, useState } from 'react'

type Status = 'Todos' | 'Pendiente' | 'En revision' | 'Resuelto'

type Report = {
  title: string
  description: string
  status: Exclude<Status, 'Todos'>
  date: string
}

const sampleReports: Report[] = [
  {
    title: 'Ejemplo de reporte uno',
    description: 'Descripcion breve para mostrar como se presenta un caso.',
    status: 'Pendiente',
    date: '12 de mayo, 2026',
  },
  {
    title: 'Ejemplo de reporte dos',
    description: 'Este texto representa informacion introductoria del reporte.',
    status: 'En revision',
    date: '09 de mayo, 2026',
  },
  {
    title: 'Ejemplo de reporte tres',
    description: 'Un tercer registro ficticio para explorar la interfaz.',
    status: 'Resuelto',
    date: '03 de mayo, 2026',
  },
]

const statuses: Status[] = ['Todos', 'Pendiente', 'En revision', 'Resuelto']

function App() {
  const [selectedStatus, setSelectedStatus] = useState<Status>('Todos')
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const visibleReports = selectedStatus === 'Todos'
    ? sampleReports
    : sampleReports.filter((report) => report.status === selectedStatus)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-paper/90">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8" aria-label="Navegacion principal">
          <a href="#inicio" className="font-display text-2xl font-bold tracking-tight">reporta<span className="text-coral">Ya</span></a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-ink/65 sm:flex">
            <a className="transition hover:text-sea" href="#reportes">Reportes</a>
            <a className="transition hover:text-sea" href="#crear">Crear reporte</a>
          </div>
        </nav>
      </header>

      <main>
        <section id="inicio" className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pt-24">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-coral">Maqueta de interfaz</p>
            <h1 className="max-w-2xl font-display text-5xl leading-[0.98] tracking-tight sm:text-7xl">Una forma clara de <span className="text-sea">reportar</span> y consultar.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink/65">ReportaYa es una propuesta para reunir reportes en un mismo lugar y hacer visible su estado. Esta primera version sirve para explorar el concepto.</p>
            <a href="#crear" className="mt-9 inline-flex items-center gap-3 rounded-full bg-coral px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-coral/20 transition hover:-translate-y-0.5 hover:bg-[#d85c4f]">Crear reporte <span aria-hidden="true">-&gt;</span></a>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-sea p-8 text-white shadow-xl shadow-sea/15 sm:p-12">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-white/10" aria-hidden="true" />
            <div className="relative">
              <p className="text-sm font-semibold text-white/70">Vista general</p>
              <p className="mt-10 font-display text-7xl">03</p>
              <p className="mt-1 text-sm text-white/75">reportes de demostracion</p>
              <div className="mt-12 border-t border-white/20 pt-5 text-sm text-white/75">Contenido ficticio para presentar el flujo visual.</div>
            </div>
          </div>
        </section>

        <section id="reportes" className="border-y border-ink/10 bg-white/55">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-sea">Explora la propuesta</p>
                <h2 className="mt-3 font-display text-4xl tracking-tight">Reportes de ejemplo</h2>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Filtrar reportes por estado">
                {statuses.map((status) => (
                  <button key={status} type="button" onClick={() => setSelectedStatus(status)} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selectedStatus === status ? 'border-sea bg-sea text-white' : 'border-ink/15 bg-white text-ink/60 hover:border-sea hover:text-sea'}`}>
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {visibleReports.map((report) => (
                <article key={report.title} className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3 text-xs text-ink/50"><span>Demostracion</span><span>{report.date}</span></div>
                  <h3 className="mt-8 font-display text-2xl">{report.title}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-ink/60">{report.description}</p>
                  <div className="mt-7 flex items-center gap-2 text-xs font-bold"><span className={`h-2 w-2 rounded-full ${report.status === 'Resuelto' ? 'bg-sea' : report.status === 'En revision' ? 'bg-amber-500' : 'bg-coral'}`} aria-hidden="true" />{report.status}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="crear" className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral">Siguiente paso</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">Crear un reporte</h2>
            <p className="mt-5 max-w-sm leading-7 text-ink/60">Completa los campos genericos para recorrer la experiencia. En esta maqueta la informacion no se envia ni se almacena.</p>
          </div>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
            <label className="block text-sm font-bold" htmlFor="title">Titulo del reporte</label>
            <input id="title" name="title" required placeholder="Escribe un titulo breve" className="mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-sea focus:ring-2 focus:ring-sea/15" />
            <label className="mt-6 block text-sm font-bold" htmlFor="description">Descripcion breve</label>
            <textarea id="description" name="description" required rows={4} placeholder="Cuenta de forma breve que quieres reportar" className="mt-2 w-full resize-none rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-sea focus:ring-2 focus:ring-sea/15" />
            <button type="submit" className="mt-6 w-full rounded-xl bg-ink px-5 py-3.5 text-sm font-bold text-white transition hover:bg-sea">Mostrar confirmacion local</button>
            {submitted && <p role="status" className="mt-4 rounded-xl bg-sea/10 px-4 py-3 text-sm font-semibold text-sea">Vista previa lista. Este reporte no se guardo en un servidor.</p>}
          </form>
        </section>
      </main>

      <footer className="border-t border-ink/10 px-5 py-7 text-center text-xs text-ink/45">Maqueta de interfaz para fines academicos. Todos los reportes y datos mostrados son de ejemplo.</footer>
    </div>
  )
}

export default App