import { useEffect, useState } from 'react'
import { errorMessage, listNotifications, markNotificationRead, type UserNotification } from '../api'
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
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!showNotifications) return
    let active = true
    setLoading(true)
    void listNotifications().then((items) => {
      if (active) setNotifications(items)
    }).catch((reason: unknown) => {
      if (active) setError(errorMessage(reason))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [showNotifications])

  async function markRead(notificationId: string) {
    setSavingId(notificationId)
    setError('')
    try {
      await markNotificationRead(notificationId)
      setNotifications((items) => items.map((item) => item.id === notificationId
        ? { ...item, readAt: new Date().toISOString() }
        : item))
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSavingId(null)
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.readAt).length

  return (
    <header className="ry-app-header">
      <div className="ry-app-header-inner">
        <Brand />
        <div className="ry-header-actions">
          {showNotifications && (
            <div className="ry-notification-menu">
              <button
                aria-controls="ry-notification-popover"
                aria-expanded={isOpen}
                aria-label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
                className="ry-header-notifications"
                onClick={() => setIsOpen((open) => !open)}
                title="Notificaciones"
                type="button"
              >
                <Icon name="bell" size={19} />
                {unreadCount > 0 && <span className="ry-notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {isOpen && (
                <section aria-label="Notificaciones recientes" className="ry-notification-popover" id="ry-notification-popover">
                  <div className="ry-notification-popover-heading">
                    <strong>Notificaciones</strong>
                    <span>{unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}</span>
                  </div>
                  {loading ? (
                    <p className="ry-notification-popover-message" role="status">Cargando notificaciones…</p>
                  ) : error ? (
                    <p className="ry-notification-popover-error" role="alert">{error}</p>
                  ) : notifications.length === 0 ? (
                    <p className="ry-notification-popover-message">Todavía no tienes notificaciones.</p>
                  ) : (
                    <div className="ry-notification-preview-list">
                      {notifications.slice(0, 5).map((notification) => (
                        <article className={`ry-notification-preview-item${notification.readAt ? '' : ' is-unread'}`} key={notification.id}>
                          <button
                            className="ry-notification-preview"
                            onClick={() => {
                              setIsOpen(false)
                              onOpenNotifications()
                            }}
                            type="button"
                          >
                            <strong>{notification.title}</strong>
                            <span>{notification.message}</span>
                            <small>{formatNotificationDate(notification.createdAt)}</small>
                          </button>
                          {!notification.readAt && (
                            <button
                              className="ry-notification-mark-read"
                              disabled={savingId !== null}
                              onClick={() => void markRead(notification.id)}
                              type="button"
                            >
                              {savingId === notification.id ? 'Guardando…' : 'Marcar leída'}
                            </button>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                  <button
                    className="ry-notification-view-all"
                    onClick={() => {
                      setIsOpen(false)
                      onOpenNotifications()
                    }}
                    type="button"
                  >
                    Ver todas las notificaciones
                  </button>
                </section>
              )}
            </div>
          )}
          <span aria-label={`Sesión activa: ${name}`} className="ry-avatar ry-avatar--small">{initials}</span>
        </div>
      </div>
    </header>
  )
}

function formatNotificationDate(value: string) {
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}
