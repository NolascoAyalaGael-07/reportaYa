import { useEffect, useState } from 'react'
import { errorMessage, listNotifications, markAllNotificationsRead, markNotificationRead, type UserNotification } from '../api'
import { Brand, Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type NotificationsScreenProps = {
  student: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenReports: () => void
  onOpenReport: (reportId: string) => void
}

function formatDate(value: string) {
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

export function NotificationsScreen({ student, onBack, onOpenHome, onOpenReports, onOpenReport }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
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
  }, [])

  async function markRead(notificationId: string) {
    setSaving(true)
    setError('')
    try {
      await markNotificationRead(notificationId)
      setNotifications((items) => items.map((item) => item.id === notificationId
        ? { ...item, readAt: new Date().toISOString() }
        : item))
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSaving(false)
    }
  }

  async function markAllRead() {
    setSaving(true)
    setError('')
    try {
      await markAllNotificationsRead()
      const readAt = new Date().toISOString()
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? readAt })))
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSaving(false)
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.readAt).length

  return (
    <div className="ry-app-shell">
      <header className="ry-app-header"><div className="ry-app-header-inner"><Brand /><span className="ry-avatar ry-avatar--small">{student.name.slice(0, 1).toUpperCase()}</span></div></header>
      <main className="ry-account-main">
        <div className="ry-account-page-heading">
          <div><button className="ry-users-back" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button><p className="ry-overline">Seguimiento</p><h1>Notificaciones</h1></div>
          {unreadCount > 0 && <button className="ry-button ry-button--outline" disabled={saving} onClick={() => void markAllRead()} type="button">Marcar todas leídas</button>}
        </div>
        <p className="ry-account-intro">Recibe aquí los cambios de estado de tus reportes.</p>
        {error && <p className="ry-form-message" role="alert">{error}</p>}
        {loading ? <p className="ry-empty-state" role="status">Cargando notificaciones…</p> : notifications.length === 0 ? (
          <p className="ry-empty-state">Todavía no tienes notificaciones. Cuando el personal actualice un reporte, te avisaremos aquí.</p>
        ) : (
          <div className="ry-notification-list">
            {notifications.map((notification) => (
              <article className={`ry-notification-card${notification.readAt ? '' : ' is-unread'}`} key={notification.id}>
                <span className="ry-setting-icon"><Icon name="bell" size={19} /></span>
                <div className="ry-notification-copy">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>{formatDate(notification.createdAt)}</small>
                  <div className="ry-notification-actions">
                    <button className="ry-text-button" onClick={() => onOpenReport(notification.reportId)} type="button">Ver reporte</button>
                    {!notification.readAt && <button className="ry-text-button" disabled={saving} onClick={() => void markRead(notification.id)} type="button">Marcar como leída</button>}
                  </div>
                </div>
                {!notification.readAt && <span aria-label="Sin leer" className="ry-unread-dot" />}
              </article>
            ))}
          </div>
        )}
      </main>
      <nav aria-label="Navegación principal" className="ry-bottom-nav">
        <button onClick={onOpenHome} type="button"><Icon name="home" /><span>Inicio</span></button>
        <button onClick={onOpenReports} type="button"><Icon name="reports" /><span>Reportes</span></button>
        <button aria-current="page" className="is-active" onClick={onBack} type="button"><Icon name="user" /><span>Mi cuenta</span></button>
      </nav>
    </div>
  )
}
