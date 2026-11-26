export type ReportStatus = 'Pendiente' | 'En atención' | 'Solucionado'

export type Report = {
  id: string
  title: string
  location: string
  category: string
  status: ReportStatus
  date: string
  description: string
  reporterName: string
  reporterControlNumber: string
  photoUrl: string | null
}

export type Student = {
  id: string
  name: string
  email: string
  controlNumber: string
  role: 'alumno' | 'mantenimiento' | 'administrador'
}
