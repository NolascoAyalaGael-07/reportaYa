import { Brand, Icon } from './Brand'

export function AppHeader({
  name,
  onOpenNotifications,
  showNotifications = true,
}: {
  name: string
  onOpenNotifications: () => void
  showNotifications?: boolean
}) {
  const initials = name.split(' ').slice(0, 2).map((part) => part.slice(0, 1).toUpperCase()).join('')

  return (
    <header className="ry-app-header">
      <div className="ry-app-header-inner">
        <Brand />
        <div className="ry-header-actions">
          {showNotifications && (
            <button aria-label="Abrir notificaciones" className="ry-header-notifications" onClick={onOpenNotifications} title="Notificaciones" type="button">
              <Icon name="bell" size={19} />
            </button>
          )}
          <span aria-label={`Sesión activa: ${name}`} className="ry-avatar ry-avatar--small">{initials}</span>
        </div>
      </div>
    </header>
  )
}
