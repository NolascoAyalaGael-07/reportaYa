import { Icon } from './Brand'
import type { ReportStatus } from '../screens/reportTypes'

const badgeStyles: Record<ReportStatus, string> = {
  Pendiente: 'text-[#c97a28] bg-[#fff2df] dark:text-[#f3c27b] dark:bg-[#473724]',
  'En atención': 'text-[#176cc8] bg-[#eaf3ff] dark:text-[#9dcaff] dark:bg-[#1c3d60]',
  Solucionado: 'text-[#258875] bg-[#e8f6f1] dark:text-[#91d6bf] dark:bg-[#1c403b]',
}

const badgeIcons = {
  Pendiente: 'clock',
  'En atención': 'settings',
  Solucionado: 'check',
} as const

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-[7px] py-1 text-[9px] font-bold ${badgeStyles[status]}`}>
      <Icon name={badgeIcons[status]} size={12} />
      {status}
    </span>
  )
}
