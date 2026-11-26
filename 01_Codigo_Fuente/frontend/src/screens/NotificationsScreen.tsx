import { useEffect, useState } from 'react'
import { errorMessage, listNotifications, markAllNotificationsRead, markNotificationRead, type UserNotification } from '../api'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type NotificationsScreenProps = {
  student: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenNotifications: () => void
  onOpenReports: () => void
  onOpenReport: (reportId: string) => void
}

function formatDate(value: string) {
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

export function NotificationsScreen({ student, onBack, onOpenHome, onOpenNotifications, onOpenReports, onOpenReport }: NotificationsScreenProps) {
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
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={student.name} onOpenNotifications={onOpenNotifications} showNotifications={false} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[860px] py-6 pb-[42px]">
        <div className="flex items-end justify-between gap-[14px]">
          <div><button className="mb-[18px] inline-flex items-center gap-[7px] border-0 bg-transparent py-1.5 text-xs font-bold text-[var(--ry-blue)]" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button><p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">Seguimiento</p><h1 className="m-0 text-[27px] tracking-[-0.7px]">Notificaciones</h1></div>
          {unreadCount > 0 && <button className="min-h-[36px] shrink-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 text-[11px] font-bold text-[var(--ry-blue)] disabled:opacity-60" disabled={saving} onClick={() => void markAllRead()} type="button">Marcar todas leídas</button>}
        </div>
        <p className="mb-5 mt-[6px] text-xs leading-[1.55] text-[var(--ry-muted)]">Recibe aquí los cambios de estado de tus reportes.</p>
        {error && <p className="rounded-[10px] border border-[#f1c7c7] bg-[#fff4f4] p-[10px] text-[11px] text-[#b42318] dark:border-[#613842] dark:bg-[#30202a] dark:text-[#ffaaaa]" role="alert">{error}</p>}
        {loading ? <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]" role="status">Cargando notificaciones…</p> : notifications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]">Todavía no tienes notificaciones. Cuando el personal actualice un reporte, te avisaremos aquí.</p>
        ) : (
          <div className="mt-[15px] grid gap-[10px]">
            {notifications.map((notification) => (
              <article className={`flex items-start gap-3 rounded-[14px] border p-[15px] transition-colors ${notification.readAt ? 'border-[var(--ry-card-border)] bg-[var(--ry-surface)]' : 'border-[#9dc5f2] bg-gradient-to-r from-[var(--ry-blue-soft)] to-[var(--ry-surface)]'}`} key={notification.id}>
                <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#eff6ff] text-[#2781e8] dark:bg-[#223852] dark:text-[#a9ccfa]"><Icon name="bell" size={19} /></span>
                <div className="min-w-0 flex-1">
                  <strong className="text-xs">{notification.title}</strong>
                  <p className="my-[5px] text-[11px] leading-[1.55] text-[var(--ry-muted)]">{notification.message}</p>
                  <small className="text-[9px] text-[var(--ry-muted)]">{formatDate(notification.createdAt)}</small>
                  <div className="mt-[7px] flex flex-wrap gap-x-[14px] gap-y-[6px]">
                    <button className="border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--ry-blue)]" onClick={() => onOpenReport(notification.reportId)} type="button">Ver reporte</button>
                    {!notification.readAt && <button className="border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--ry-blue)] disabled:opacity-60" disabled={saving} onClick={() => void markRead(notification.id)} type="button">Marcar como leída</button>}
                  </div>
                </div>
                {!notification.readAt && <span aria-label="Sin leer" className="mt-[5px] size-[9px] shrink-0 rounded-full bg-[var(--ry-blue)]" />}
              </article>
            ))}
          </div>
        )}
      </main>
      <BottomNav items={[
        { label: 'Inicio', icon: 'home', onClick: onOpenHome },
        { label: 'Reportes', icon: 'reports', onClick: onOpenReports },
        { label: 'Mi cuenta', icon: 'user', onClick: onBack, active: true },
      ]} />
    </div>
  )
}
