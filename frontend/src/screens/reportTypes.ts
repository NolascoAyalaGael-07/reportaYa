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
  name: string
  email: string
  controlNumber: string
}

export const initialReports: Report[] = [
  {
    id: 'report-1',
    title: 'Lámpara sin funcionar',
    location: 'Edificio B · Salón 204',
    category: 'Electricidad',
    status: 'Pendiente',
    date: '12 oct',
    description: 'La lámpara del salón 204 no enciende.',
  },
  {
    id: 'report-2',
    title: 'Fuga en el lavabo',
    location: 'Edificio A · Baños',
    category: 'Plomería',
    status: 'En atención',
    date: '10 oct',
    description: 'El lavabo del baño tiene una fuga de agua.',
  },
  {
    id: 'report-3',
    title: 'Bote de basura lleno',
    location: 'Patio central',
    category: 'Limpieza',
    status: 'Solucionado',
    date: '08 oct',
    description: 'El bote de basura del patio central necesitaba vaciarse.',
  },
]
