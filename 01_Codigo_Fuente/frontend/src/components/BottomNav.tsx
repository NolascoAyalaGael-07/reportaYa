import { Icon, type IconName } from './Brand'

export type BottomNavItem = {
  label: string
  icon: IconName
  onClick?: () => void
  active?: boolean
}

export function BottomNav({ items }: { items: BottomNavItem[] }) {
  const columns = items.length === 4 ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <nav aria-label="Navegación principal" className={`fixed inset-x-0 bottom-0 z-[6] grid min-h-[70px] ${columns} border-t border-[#e4ebf3] bg-white/90 [padding:6px_max(16px,calc((100vw-600px)/2))] backdrop-blur-xl dark:border-[#293d53] dark:bg-[#101e2d]/95`}>
      {items.map((item) => (
        <button
          aria-current={item.active ? 'page' : undefined}
          className={`grid min-w-0 justify-items-center gap-[3px] rounded-[11px] border-0 bg-transparent p-[5px] text-[10px] disabled:cursor-default disabled:opacity-100${item.active ? ' bg-[#eaf3ff] text-[var(--ry-blue)] dark:bg-[#1b3551] dark:text-[#a9ccfa]' : ' text-[#8a9aaf]'}`}
          key={item.label}
          disabled={!item.onClick}
          onClick={item.onClick}
          type="button"
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
