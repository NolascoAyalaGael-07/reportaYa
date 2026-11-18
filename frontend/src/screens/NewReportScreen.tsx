import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Brand'
import type { Report, Student } from './reportTypes'

export type NewReportInput = Pick<Report, 'category' | 'location' | 'description'> & { photo: File | null }

type NewReportScreenProps = {
  student: Student
  onCancel: () => void
  onSubmitReport: (report: NewReportInput) => Promise<void>
  onOpenHome: () => void
  onOpenNotifications: () => void
  onOpenReports: () => void
  onOpenSettings: () => void
  onCreateReport: () => void
}

const categories = ['Electricidad', 'Plomería', 'Limpieza', 'Mobiliario', 'Otro']
const fieldCardClass = 'grid min-w-0 gap-[10px] rounded-xl border border-[#e0e9f4] bg-white p-3 dark:border-[var(--ry-card-border)] dark:bg-[var(--ry-surface)]'
const fieldTitleClass = 'flex items-start gap-[9px] text-[var(--ry-blue)]'
const fieldInputClass = 'min-h-[38px] w-full min-w-0 rounded-[9px] border border-[var(--ry-line)] bg-[#fbfdff] px-[10px] text-[11px] text-[var(--ry-ink)] outline-none dark:bg-[#142438]'

export function NewReportScreen({
  student,
  onCancel,
  onSubmitReport,
  onOpenHome,
  onOpenNotifications,
  onOpenReports,
  onOpenSettings,
  onCreateReport,
}: NewReportScreenProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [descriptionLength, setDescriptionLength] = useState(0)
  const previewUrl = useMemo(() => photo ? URL.createObjectURL(photo) : null, [photo])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    setPhotoError('')

    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Elige una imagen JPG o PNG.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La imagen debe pesar 5 MB o menos.')
      return
    }

    setPhoto(file)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const description = String(formData.get('description')).trim()
    const location = String(formData.get('location')).trim()

    if (!description || !location) {
      setFormError('Completa la ubicación y la descripción para enviar el reporte.')
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      await onSubmitReport({
        category: String(formData.get('category')),
        location,
        description,
        photo,
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el reporte. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ry-background)] pb-[90px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-36px)] max-w-[820px] py-[18px]">
        <div className="mb-[15px] flex items-start gap-3">
          <button aria-label="Volver" className="mt-px grid size-[34px] shrink-0 place-items-center border-0 bg-transparent p-[3px] text-[var(--ry-blue)]" onClick={onCancel} type="button"><Icon name="arrow-left" /></button>
          <div><h1 className="m-0 text-[23px] tracking-[-0.5px]">Crear reporte</h1><p className="mt-[3px] max-w-[560px] text-xs leading-[1.5] text-[var(--ry-muted)]">Describe el problema, agrega una foto y selecciona la categoría para que podamos atenderlo.</p></div>
        </div>
        <form className="grid gap-[11px]" onSubmit={handleSubmit}>
          <section aria-label="Fotografía del problema" className="relative grid min-h-[132px] place-items-center overflow-hidden rounded-[14px] border border-[#e1eaf4] bg-gradient-to-br from-[#e8f2fd] to-[#f8fbff] dark:border-[var(--ry-card-border)] dark:from-[#182b40] dark:to-[#142438]">
            {previewUrl ? (
              <>
                <img alt="Vista previa del problema" className="block max-h-[280px] w-full object-cover" src={previewUrl} />
                <button aria-label="Quitar fotografía" className="absolute right-[10px] top-[10px] grid size-[33px] place-items-center rounded-full border border-[#f1dce0] bg-white text-[#da5361] dark:border-[#613842] dark:bg-[#30202a]" onClick={() => setPhoto(null)} type="button"><Icon name="trash" size={18} /></button>
              </>
            ) : (
              <div className="grid justify-items-center gap-[7px] p-5 text-center text-[#70a6e3]"><Icon name="camera" size={34} /><strong className="text-xs text-[#4a6b91] dark:text-[#b4cbe5]">Agrega una foto del problema</strong><span className="text-[10px] text-[#8ca1b8]">Opcional · JPG o PNG · máximo 5 MB</span></div>
            )}
          </section>
          <label className="grid min-h-[45px] cursor-pointer grid-cols-[auto_auto] content-center items-center justify-center gap-x-[7px] rounded-[11px] border border-[#e4edf7] bg-[#edf5ff] p-[7px] text-[var(--ry-blue)] dark:border-[#29435f] dark:bg-[#182d45]">
            <input accept="image/jpeg,image/png" className="sr-only" onChange={handlePhotoChange} type="file" />
            <Icon name="camera" size={19} /><strong>{photo ? 'Cambiar foto' : 'Agregar fotografía'}</strong>
            <span className="col-start-2 text-[9px] text-[#849ab4]">JPG, PNG (máx. 5 MB)</span>
          </label>
          {photoError && <p className="m-0 text-[11px] text-[#b42318]" role="alert">{photoError}</p>}
          <div className="grid grid-cols-1 gap-[11px] min-[600px]:grid-cols-2">
            <label className={fieldCardClass} htmlFor="report-category">
              <span className={fieldTitleClass}><Icon name="layers" /><span className="grid gap-[3px] text-[var(--ry-ink)]"><strong className="text-[11px]">Categoría</strong><small className="text-[9px] leading-[1.4] text-[var(--ry-muted)]">Selecciona el tipo de problema.</small></span></span>
              <select className={`${fieldInputClass} cursor-pointer`} defaultValue={categories[0]} id="report-category" name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select>
            </label>
            <label className={fieldCardClass} htmlFor="report-location">
              <span className={fieldTitleClass}><Icon name="pin" /><span className="grid gap-[3px] text-[var(--ry-ink)]"><strong className="text-[11px]">Ubicación</strong><small className="text-[9px] leading-[1.4] text-[var(--ry-muted)]">Indica el lugar exacto del incidente.</small></span></span>
              <input autoComplete="street-address" className={fieldInputClass} id="report-location" name="location" placeholder="Edificio y salón" required />
            </label>
          </div>
          <label className={fieldCardClass} htmlFor="report-description">
            <span className={fieldTitleClass}><Icon name="reports" /><span className="grid gap-[3px] text-[var(--ry-ink)]"><strong className="text-[11px]">Descripción</strong><small className="text-[9px] leading-[1.4] text-[var(--ry-muted)]">Añade más detalles sobre el problema.</small></span></span>
            <textarea className={`${fieldInputClass} min-h-[76px] resize-y py-[9px] leading-[1.5]`} id="report-description" maxLength={500} name="description" onChange={(event) => setDescriptionLength(event.currentTarget.value.length)} placeholder="Cuéntanos qué ocurrió, desde cuándo y si ya se notificó a alguien." required rows={4} />
            <span className="-mt-[7px] text-right text-[9px] text-[#91a4ba]">{descriptionLength}/500</span>
          </label>
          <div className="grid grid-cols-1 items-stretch gap-[11px] min-[600px]:grid-cols-2">
            <label className={`${fieldCardClass} relative cursor-pointer`}>
              <span className={fieldTitleClass}><Icon name="camera" /><span className="grid gap-[3px] text-[var(--ry-ink)]"><strong className="text-[11px]">Fotografía</strong><small className="text-[9px] leading-[1.4] text-[var(--ry-muted)]">Agrega una imagen del problema (opcional).</small></span></span>
              <span className="grid min-h-[78px] content-center justify-items-center gap-1 rounded-[9px] border border-dashed border-[#c9dcf2] bg-[#f9fcff] text-[10px] text-[var(--ry-blue)] dark:border-[#36536f] dark:bg-[#142438]"><Icon name="camera" size={22} /><strong>{photo ? 'Cambiar foto' : 'Agregar foto'}</strong><small className="text-[9px] text-[var(--ry-muted)]">JPG, PNG (máx. 5 MB)</small></span>
              <input accept="image/jpeg,image/png" className="sr-only" onChange={handlePhotoChange} type="file" />
            </label>
            <section className={fieldCardClass} aria-label="Estado inicial del reporte">
              <span className={fieldTitleClass}><Icon name="check" /><span className="grid gap-[3px] text-[var(--ry-ink)]"><strong className="text-[11px]">Estado del reporte</strong><small className="text-[9px] leading-[1.4] text-[var(--ry-muted)]">Estado inicial para seguimiento.</small></span></span>
              <span className="flex min-h-[38px] w-full items-center gap-[7px] rounded-[9px] border border-[var(--ry-line)] bg-[#fbfdff] px-[10px] text-[11px] text-[var(--ry-ink)] dark:bg-[#142438]"><i className="size-[7px] rounded-full bg-[#f49b4a]" /><strong>Pendiente</strong></span>
              <small className="text-[9px] text-[var(--ry-muted)]">El personal administrativo podrá actualizarlo.</small>
            </section>
          </div>
          {formError && <p className="m-0 text-[11px] text-[#b42318]" role="alert">{formError}</p>}
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] bg-[var(--ry-blue)] px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit"><Icon name="arrow-right" /> {submitting ? 'Guardando…' : 'Enviar reporte'}</button>
        </form>
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: 'Crear reporte', icon: 'plus', onClick: onCreateReport, active: true },
        { label: 'Mis reportes', icon: 'reports', onClick: onOpenReports },
        { label: 'Mi cuenta', icon: 'user', onClick: onOpenSettings },
      ]} />
    </div>
  )
}
