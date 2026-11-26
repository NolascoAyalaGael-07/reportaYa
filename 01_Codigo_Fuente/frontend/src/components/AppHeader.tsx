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
    <header className="sticky top-0 z-[5] border-b border-[#e8eef5] bg-white/90 backdrop-blur-xl dark:border-[#293d53] dark:bg-[#101e2d]/95">
      <div className="mx-auto flex min-h-[68px] w-[min(100%-40px,900px)] items-center justify-between max-[430px]:w-[calc(100%-40px)]">
        <Brand />
        <div className="relative flex items-center gap-[9px]">
          {showNotifications && (
            <div className="relative">
              <button
                aria-controls="ry-notification-popover"
                aria-expanded={isOpen}
                aria-label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
                className="relative grid size-[38px] cursor-pointer place-items-center rounded-xl border border-[var(--ry-line)] bg-[var(--ry-surface)] text-[#607995] dark:border-[var(--ry-card-border)] dark:bg-[#1a2b40] dark:text-[#b8d5f7]"
                onClick={() => setIsOpen((open) => !open)}
                title="Notificaciones"
                type="button"
              >
                <Icon name="bell" size={19} />
                {unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-[var(--ry-surface)] bg-[#d94352] px-1 text-[9px] font-bold leading-none text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {isOpen && (
                <section aria-label="Notificaciones recientes" className="absolute right-0 top-[calc(100%+10px)] z-[12] max-h-[min(460px,calc(100vh-105px))] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-[14px] border border-[var(--ry-card-border)] bg-[var(--ry-surface)] text-[var(--ry-ink)] shadow-[0_14px_36px_#152b4530]" id="ry-notification-popover">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--ry-line)] px-[15px] pb-[11px] pt-[14px]">
                    <strong className="text-[13px]">Notificaciones</strong>
                    <span className="text-[10px] text-[var(--ry-muted)]">{unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}</span>
                  </div>
                  {loading ? (
                    <p className="px-[15px] py-[18px] text-center text-[11px] text-[var(--ry-muted)]" role="status">Cargando notificaciones…</p>
                  ) : error ? (
                    <p className="px-[15px] py-[18px] text-center text-[11px] text-[#b42318] dark:text-[#ffb1b8]" role="alert">{error}</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-[15px] py-[18px] text-center text-[11px] text-[var(--ry-muted)]">Todavía no tienes notificaciones.</p>
                  ) : (
                    <div className="grid">
                      {notifications.slice(0, 5).map((notification) => (
                        <article className={`border-b border-[var(--ry-line)] px-[13px] py-[9px]${notification.readAt ? '' : ' bg-[#f3f8ff] dark:bg-[#1b3551]'}`} key={notification.id}>
                          <button
                            className="grid w-full cursor-pointer gap-1 border-0 bg-transparent p-0.5 text-left text-[var(--ry-ink)]"
                            onClick={() => {
                              setIsOpen(false)
                              onOpenNotifications()
                            }}
                            type="button"
                          >
                            <strong className="text-[11px]">{notification.title}</strong>
                            <span className="line-clamp-2 text-[10px] leading-[1.45] text-[var(--ry-muted)]">{notification.message}</span>
                            <small className="text-[10px] text-[var(--ry-muted)]">{formatNotificationDate(notification.createdAt)}</small>
                          </button>
                          {!notification.readAt && (
                            <button
                              className="cursor-pointer border-0 bg-transparent px-0.5 pb-0 pt-1.5 text-[10px] font-bold text-[var(--ry-blue)]"
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
                    className="w-full cursor-pointer border-0 border-t border-solid border-[var(--ry-line)] bg-transparent p-3 text-center text-[10px] font-bold text-[var(--ry-blue)]"
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
          <span aria-label={`Sesión activa: ${name}`} className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#e8f2ff] text-xs font-bold text-[var(--ry-blue)] dark:bg-[#223852]">{initials}</span>
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
