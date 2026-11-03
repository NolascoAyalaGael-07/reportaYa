export type ReportStatus = 'Pendiente' | 'En atención' | 'Solucionado'

export type Report = {
  id: string
  title: string
  location: string
  category: string
  status: ReportStatus
  date: string
  description: string
}

export type Student = {
  id: string
  name: string
  email: string
  controlNumber: string
}
