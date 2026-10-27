import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Brand, Icon } from '../components/Brand'
import type { Report, ReportStatus } from './reportTypes'

type NewReportScreenProps = {
  onCancel: () => void
  onSubmitReport: (report: Omit<Report, 'id' | 'date'>) => void
  onOpenHome: () => void
  onOpenReports: () => void
  onOpenSettings: () => void
  onCreateReport: () => void
}

const categories = ['Electricidad', 'Plomería', 'Limpieza', 'Mobiliario', 'Otro']
const statuses: ReportStatus[] = ['Pendiente', 'En atención', 'Solucionado']

function parseStatus(value: FormDataEntryValue | null): ReportStatus {
  switch (value) {
    case 'Pendiente':
    case 'En atención':
    case 'Solucionado':
      return value
    default:
      throw new Error('Selecciona un estado válido para el reporte.')
  }
}

export function NewReportScreen({
  onCancel,
  onSubmitReport,
  onOpenHome,
  onOpenReports,
  onOpenSettings,
  onCreateReport,
}: NewReportScreenProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [formError, setFormError] = useState('')
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const description = String(formData.get('description')).trim()
    const location = String(formData.get('location')).trim()

    if (!description || !location) {
      setFormError('Completa la ubicación y la descripción para enviar el reporte.')
      return
    }

    setFormError('')
    onSubmitReport({
      title: description.length > 40 ? `${description.slice(0, 37)}…` : description,
      category: String(formData.get('category')),
      location,
      description,
      status: parseStatus(formData.get('status')),
    })
  }

  return (
    <div className="ry-app-shell ry-report-shell">
      <header className="ry-app-header">
        <div className="ry-app-header-inner">
          <Brand />
          <span aria-label="Sesión activa" className="ry-avatar ry-avatar--small">AM</span>
        </div>
      </header>
      <main className="ry-create-main">
        <div className="ry-create-heading">
          <button aria-label="Volver" className="ry-create-back" onClick={onCancel} type="button"><Icon name="arrow-left" /></button>
          <div><h1>Crear reporte</h1><p>Describe el problema, agrega una foto y selecciona la categoría para que podamos atenderlo.</p></div>
        </div>
        <form className="ry-create-form" onSubmit={handleSubmit}>
          <section aria-label="Fotografía del problema" className="ry-photo-preview">
            {previewUrl ? (
              <>
                <img alt="Vista previa del problema" src={previewUrl} />
                <button aria-label="Quitar fotografía" className="ry-photo-remove" onClick={() => setPhoto(null)} type="button"><Icon name="trash" size={18} /></button>
              </>
            ) : (
              <div className="ry-photo-placeholder"><Icon name="camera" size={34} /><strong>Agrega una foto del problema</strong><span>Opcional · JPG o PNG · máximo 5 MB</span></div>
            )}
          </section>
          <label className="ry-photo-change">
            <input accept="image/jpeg,image/png" onChange={handlePhotoChange} type="file" />
            <Icon name="camera" size={19} /><strong>{photo ? 'Cambiar foto' : 'Agregar fotografía'}</strong>
            <span>JPG, PNG (máx. 5 MB)</span>
          </label>
          {photoError && <p className="ry-photo-error" role="alert">{photoError}</p>}
          <div className="ry-create-field-grid">
            <label className="ry-field-card" htmlFor="report-category">
              <span className="ry-field-title"><Icon name="layers" /><span><strong>Categoría</strong><small>Selecciona el tipo de problema.</small></span></span>
              <select defaultValue={categories[0]} id="report-category" name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select>
            </label>
            <label className="ry-field-card" htmlFor="report-location">
              <span className="ry-field-title"><Icon name="pin" /><span><strong>Ubicación</strong><small>Indica el lugar exacto del incidente.</small></span></span>
              <input autoComplete="street-address" id="report-location" name="location" placeholder="Edificio y salón" required />
            </label>
          </div>
          <label className="ry-field-card ry-description-card" htmlFor="report-description">
            <span className="ry-field-title"><Icon name="reports" /><span><strong>Descripción</strong><small>Añade más detalles sobre el problema.</small></span></span>
            <textarea id="report-description" maxLength={500} name="description" onChange={(event) => setDescriptionLength(event.currentTarget.value.length)} placeholder="Cuéntanos qué ocurrió, desde cuándo y si ya se notificó a alguien." required rows={4} />
            <span className="ry-character-count">{descriptionLength}/500</span>
          </label>
          <div className="ry-create-field-grid ry-create-bottom-grid">
            <label className="ry-field-card ry-upload-card">
              <span className="ry-field-title"><Icon name="camera" /><span><strong>Fotografía</strong><small>Agrega una imagen del problema (opcional).</small></span></span>
              <span className="ry-upload-inner"><Icon name="camera" size={22} /><strong>{photo ? 'Cambiar foto' : 'Agregar foto'}</strong><small>JPG, PNG (máx. 5 MB)</small></span>
              <input accept="image/jpeg,image/png" className="ry-visually-hidden" onChange={handlePhotoChange} type="file" />
            </label>
            <label className="ry-field-card ry-status-card" htmlFor="report-status">
              <span className="ry-field-title"><Icon name="check" /><span><strong>Estado del reporte</strong><small>Estado inicial para seguimiento.</small></span></span>
              <span className="ry-status-select"><i className="ry-dot ry-dot--pending" /><select defaultValue={statuses[0]} id="report-status" name="status">{statuses.map((status) => <option key={status}>{status}</option>)}</select></span>
              <small className="ry-status-help">El personal administrativo podrá actualizarlo.</small>
            </label>
          </div>
          {formError && <p className="ry-photo-error" role="alert">{formError}</p>}
          <button className="ry-button ry-button--primary ry-submit-report" type="submit"><Icon name="arrow-right" /> Enviar reporte</button>
        </form>
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav ry-bottom-nav--four">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button aria-current="page" className="is-active" onClick={onCreateReport} type="button"><Icon name="plus" /><span>Crear reporte</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Mis reportes</span></button>
        <button onClick={onOpenSettings} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
