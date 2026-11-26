import { useEffect, useState, type FormEvent } from 'react'
import { createMaintenanceUser, errorMessage, listUsers } from '../api'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Brand'
import type { Student } from './reportTypes'

type UsersScreenProps = {
  currentUser: Student
  onBack: () => void
  onOpenHome: () => void
  onOpenReports: () => void
  onOpenNotifications: () => void
}

const roleLabels: Record<Student['role'], string> = {
  alumno: 'Alumno',
  mantenimiento: 'Mantenimiento',
  administrador: 'Administrador',
}

export function UsersScreen({ currentUser, onBack, onOpenHome, onOpenReports, onOpenNotifications }: UsersScreenProps) {
  const [users, setUsers] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<'todos' | Student['role']>('todos')

  useEffect(() => {
    let active = true
    void listUsers().then((items) => {
      if (active) setUsers(items)
    }).catch((reason: unknown) => {
      if (active) setError(errorMessage(reason))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleCreateMaintenanceUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setCreatingUser(true)
    setError('')
    setSuccess('')
    try {
      const created = await createMaintenanceUser({
        name: String(formData.get('name')).trim(),
        controlNumber: String(formData.get('controlNumber')).trim(),
        email: String(formData.get('email')).trim(),
        password: String(formData.get('password')),
      })
      setUsers((current) => [created, ...current])
      setSuccess(`Se agregó a ${created.name} al equipo de mantenimiento.`)
      form.reset()
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setCreatingUser(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const text = `${user.name} ${user.email} ${user.controlNumber}`.toLocaleLowerCase('es-MX')
    return (selectedRole === 'todos' || user.role === selectedRole) && text.includes(query.trim().toLocaleLowerCase('es-MX'))
  })

  return (
    <div className="min-h-screen bg-[var(--ry-background)] pb-[88px] text-[var(--ry-ink)]">
      <AppHeader name={currentUser.name} onOpenNotifications={onOpenNotifications} />
      <main className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-7 pb-10">
        <button className="mb-[18px] inline-flex items-center gap-[7px] border-0 bg-transparent py-1.5 text-xs font-bold text-[var(--ry-blue)]" onClick={onBack} type="button"><Icon name="arrow-left" size={18} /> Configuración</button>
        <div className="mb-[18px] flex items-end justify-between gap-[18px] max-[480px]:items-center">
          <div><p className="mb-[5px] text-[11px] font-semibold text-[#7690ad]">Solo administración</p><h1 className="m-0 text-[29px] tracking-[-0.8px] max-[480px]:text-2xl">Gestionar usuarios</h1><p className="mt-[5px] text-xs text-[var(--ry-muted)]">Consulta las cuentas y agrega personal de mantenimiento.</p></div>
          <span className="shrink-0 rounded-full border border-[var(--ry-line)] bg-white px-3 py-2 text-[11px] font-bold text-[#3c638d] dark:bg-[var(--ry-surface)]">{users.length} cuentas</span>
        </div>
        <section aria-labelledby="create-maintenance-title" className="mb-5 rounded-2xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-4">
          <h2 className="mb-[5px] mt-0 text-[16px]" id="create-maintenance-title">Agregar usuario de mantenimiento</h2>
          <p className="mb-3 text-[11px] text-[var(--ry-muted)]">La cuenta se creará directamente con permisos de mantenimiento.</p>
          <form className="grid gap-[9px] rounded-2xl border border-[var(--ry-card-border)] bg-[var(--ry-surface)] p-4" onSubmit={(event) => void handleCreateMaintenanceUser(event)}>
            <label className="mt-1.5 text-[11px] font-bold" htmlFor="maintenance-name">Nombre completo</label>
            <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="name" id="maintenance-name" maxLength={150} minLength={2} name="name" required />
            <label className="mt-1.5 text-[11px] font-bold" htmlFor="maintenance-control">Número de control o empleado</label>
            <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="off" id="maintenance-control" maxLength={30} minLength={2} name="controlNumber" required />
            <label className="mt-1.5 text-[11px] font-bold" htmlFor="maintenance-email">Correo electrónico</label>
            <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="email" id="maintenance-email" maxLength={254} name="email" required type="email" />
            <label className="mt-1.5 text-[11px] font-bold" htmlFor="maintenance-password">Contraseña inicial</label>
            <input className="min-h-[42px] w-full min-w-0 rounded-[10px] border border-[var(--ry-line)] bg-[var(--ry-surface)] px-3 py-[10px] text-xs text-[var(--ry-ink)]" autoComplete="new-password" id="maintenance-password" maxLength={128} minLength={8} name="password" required type="password" />
            <small className="-mt-[5px] text-[10px] text-[var(--ry-muted)]">El usuario podrá cambiarla desde los datos de su cuenta.</small>
            <button className="mt-1.5 min-h-11 rounded-[11px] bg-[var(--ry-blue)] px-3 text-xs font-bold text-white disabled:opacity-60" disabled={creatingUser} type="submit">{creatingUser ? 'Agregando…' : 'Agregar usuario'}</button>
          </form>
        </section>
        <div className="mb-5 grid gap-3 min-[760px]:grid-cols-3">
          <article className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-x-[10px] gap-y-1 rounded-[14px] border border-[var(--ry-card-border)] bg-[#f9fbfe] p-[14px] shadow-[0_4px_14px_#18335408] dark:bg-[var(--ry-surface)]"><span className="row-span-2 grid size-[34px] place-items-center rounded-[11px] bg-[var(--ry-blue-soft)] text-[var(--ry-blue)]"><Icon name="user" size={17} /></span><strong className="text-[11px]">Alumno</strong><span className="text-[10px] leading-[1.4] text-[var(--ry-muted)]">Registra y consulta sus reportes.</span></article>
          <article className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-x-[10px] gap-y-1 rounded-[14px] border border-[var(--ry-card-border)] bg-[#f9fbfe] p-[14px] shadow-[0_4px_14px_#18335408] dark:bg-[var(--ry-surface)]"><span className="row-span-2 grid size-[34px] place-items-center rounded-[11px] bg-[var(--ry-blue-soft)] text-[var(--ry-blue)]"><Icon name="settings" size={17} /></span><strong className="text-[11px]">Mantenimiento</strong><span className="text-[10px] leading-[1.4] text-[var(--ry-muted)]">Consulta reportes y actualiza estados.</span></article>
          <article className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-x-[10px] gap-y-1 rounded-[14px] border border-[var(--ry-card-border)] bg-[#f9fbfe] p-[14px] shadow-[0_4px_14px_#18335408] dark:bg-[var(--ry-surface)]"><span className="row-span-2 grid size-[34px] place-items-center rounded-[11px] bg-[var(--ry-blue-soft)] text-[var(--ry-blue)]"><Icon name="shield" size={17} /></span><strong className="text-[11px]">Administrador</strong><span className="text-[10px] leading-[1.4] text-[var(--ry-muted)]">Gestiona usuarios y reportes.</span></article>
        </div>
        {error && <p className="rounded-[10px] border border-[#f1c7c7] bg-[#fff4f4] p-[10px] text-[11px] text-[#b42318] dark:border-[#613842] dark:bg-[#30202a] dark:text-[#ffaaaa]" role="alert">{error}</p>}
        {success && <p className="rounded-[10px] border border-[#cceadd] bg-[#f0fbf5] p-[10px] text-[11px] text-[#19745d] dark:border-[#285746] dark:bg-[#1b352e]" role="status">{success}</p>}
        {loading ? (
          <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]" role="status">Cargando usuarios…</p>
        ) : (
          <>
            <section aria-label="Buscar y filtrar usuarios" className="mb-3 grid gap-[9px]">
              <label className="flex min-h-[42px] items-center gap-2 rounded-[10px] border border-[var(--ry-line)] bg-white px-[11px] text-[#8ca1b8] dark:bg-[var(--ry-surface)]"><Icon name="search" size={18} /><input aria-label="Buscar usuarios" className="min-w-0 flex-1 bg-transparent py-[9px] text-[11px] text-[var(--ry-ink)] outline-none placeholder:text-[#99aabe]" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Buscar por nombre, correo o control" value={query} /></label>
              <div aria-label="Filtrar usuarios por rol" className="flex gap-1.5 overflow-x-auto pb-0.5">
                {(['todos', 'alumno', 'mantenimiento', 'administrador'] as const).map((role) => (
                  <button aria-pressed={selectedRole === role} className={`shrink-0 rounded-full border border-[var(--ry-line)] px-[10px] py-[7px] text-[10px] ${selectedRole === role ? 'border-[var(--ry-blue)] bg-[var(--ry-blue)] text-white' : 'bg-white text-[#70849b] dark:bg-[var(--ry-surface)] dark:text-[var(--ry-muted)]'}`} key={role} onClick={() => setSelectedRole(role)} type="button">
                    {role === 'todos' ? 'Todos' : roleLabels[role]}
                  </button>
                ))}
              </div>
            </section>
            <div className="grid gap-[10px]">
            {filteredUsers.map((user) => (
              <article className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-[14px] rounded-[14px] border border-[var(--ry-card-border)] bg-[var(--ry-surface)] px-4 py-[15px] shadow-[0_5px_18px_#18335408] transition hover:-translate-y-px hover:border-[#bed6f1]" key={user.id}>
                <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#e8f2ff] text-xs font-bold text-[var(--ry-blue)] dark:bg-[#223852]">{user.name.slice(0, 1).toUpperCase()}{user.name.split(' ')[1]?.slice(0, 1).toUpperCase() ?? ''}</span>
                <span className="grid min-w-0 gap-[3px]">
                  <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">{user.name}{user.id === currentUser.id ? ' (tú)' : ''}</strong>
                  <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--ry-muted)]">{user.email} · {user.controlNumber}</small>
                  <small className="text-[10px] font-bold text-[var(--ry-blue)]">{roleLabels[user.role]}</small>
                </span>
              </article>
            ))}
            {filteredUsers.length === 0 && <p className="rounded-xl border border-dashed border-[var(--ry-line)] bg-white p-[22px] text-center text-[13px] text-[var(--ry-muted)] dark:bg-[var(--ry-surface)]">No se encontraron cuentas con esos filtros.</p>}
            </div>
          </>
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
