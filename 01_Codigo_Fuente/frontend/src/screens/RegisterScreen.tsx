import { FormEvent, useState } from 'react'
import { Brand, Icon } from '../components/Brand'

type RegisterScreenProps = {
  onCreateAccount: (name: string, controlNumber: string, email: string, password: string) => Promise<void>
  onLogin: () => void
}

export function RegisterScreen({ onCreateAccount, onLogin }: RegisterScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password'))
    const confirmation = String(formData.get('confirmation'))

    if (password !== confirmation) {
      setMessage('Las contraseñas no coinciden. Verifica e inténtalo de nuevo.')
      return
    }

    try {
      await onCreateAccount(
        String(formData.get('name')).trim(),
        String(formData.get('controlNumber')).trim(),
        String(formData.get('email')).trim(),
        password,
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear la cuenta. Inténtalo de nuevo.')
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_50%_0,#e8f2ff_0,transparent_55%)] p-6 dark:bg-[radial-gradient(ellipse_at_50%_0,#172b42_0,transparent_55%)] max-[430px]:p-0">
      <section aria-labelledby="register-title" className="w-full max-w-[440px] overflow-hidden rounded-[22px] border border-[#e0e8f1] bg-[var(--ry-surface)] shadow-[0_20px_60px_#19345212] dark:border-[var(--ry-card-border)] max-[430px]:min-h-screen max-[430px]:rounded-none max-[430px]:border-0 max-[430px]:shadow-none">
        <header className="flex items-center justify-between border-b border-[#eef2f6] px-[22px] py-[18px] dark:border-[var(--ry-line)]">
          <Brand />
          <button aria-label="Volver al inicio de sesión" className="grid size-[38px] cursor-pointer place-items-center rounded-xl border border-[var(--ry-line)] bg-white text-[#73869d] dark:bg-[#1a2b40]" onClick={onLogin} type="button"><Icon name="arrow-left" /></button>
        </header>
        <div className="px-[22px] pb-[18px] pt-[21px]">
          <h1 className="mb-1 text-2xl tracking-[-0.5px]" id="register-title">Súmate al cambio</h1>
          <p className="text-[13px] leading-[1.55] text-[var(--ry-muted)]">Crea tu cuenta y ayuda a cuidar los espacios que compartimos.</p>
          <div className="mt-[15px] flex min-h-[39px] items-center gap-[9px] rounded-[10px] bg-[var(--ry-blue-soft)] px-[11px] py-2 text-xs font-bold text-[var(--ry-blue)]"><Icon name="spark" size={17} /> Cuenta de estudiante</div>
          <form className="mt-[13px] grid gap-[5px]" onSubmit={handleSubmit}>
            <label className="mt-[5px] text-xs font-bold" htmlFor="register-name">Nombre completo</label>
            <div className="flex min-h-[45px] items-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-[11px] text-[#98a8bb] focus-within:border-[#7ab2f5] focus-within:shadow-[0_0_0_3px_#dcecff] dark:bg-[#102034]"><Icon name="user" /><input autoComplete="name" className="min-w-0 flex-1 bg-transparent py-[11px] text-[13px] text-[var(--ry-ink)] outline-none placeholder:text-[#a4b1c0]" id="register-name" name="name" placeholder="Tu nombre y apellidos" required /></div>
            <label className="mt-[5px] text-xs font-bold" htmlFor="register-control">Número de control</label>
            <div className="flex min-h-[45px] items-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-[11px] text-[#98a8bb] focus-within:border-[#7ab2f5] focus-within:shadow-[0_0_0_3px_#dcecff] dark:bg-[#102034]"><Icon name="reports" /><input autoComplete="off" className="min-w-0 flex-1 bg-transparent py-[11px] text-[13px] text-[var(--ry-ink)] outline-none placeholder:text-[#a4b1c0]" id="register-control" name="controlNumber" placeholder="Ej. 23210000" required /></div>
            <label className="mt-[5px] text-xs font-bold" htmlFor="register-email">Correo electrónico</label>
            <div className="flex min-h-[45px] items-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-[11px] text-[#98a8bb] focus-within:border-[#7ab2f5] focus-within:shadow-[0_0_0_3px_#dcecff] dark:bg-[#102034]"><Icon name="mail" /><input autoComplete="email" className="min-w-0 flex-1 bg-transparent py-[11px] text-[13px] text-[var(--ry-ink)] outline-none placeholder:text-[#a4b1c0]" id="register-email" name="email" placeholder="nombre@ejemplo.com" required type="email" /></div>
            <label className="mt-[5px] text-xs font-bold" htmlFor="register-password">Contraseña</label>
            <div className="flex min-h-[45px] items-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-[11px] text-[#98a8bb] focus-within:border-[#7ab2f5] focus-within:shadow-[0_0_0_3px_#dcecff] dark:bg-[#102034]">
              <Icon name="lock" />
              <input autoComplete="new-password" className="min-w-0 flex-1 bg-transparent py-[11px] text-[13px] text-[var(--ry-ink)] outline-none placeholder:text-[#a4b1c0]" id="register-password" minLength={8} name="password" placeholder="Crea una contraseña" required type={passwordVisible ? 'text' : 'password'} />
              <button aria-label={passwordVisible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} className="grid cursor-pointer place-items-center border-0 bg-transparent p-1 text-[#8c9db1]" onClick={() => setPasswordVisible(!passwordVisible)} type="button"><Icon name="eye" size={18} /></button>
            </div>
            <small className="-mt-px text-[10px] text-[var(--ry-muted)]">Usa al menos 8 caracteres.</small>
            <label className="mt-[5px] text-xs font-bold" htmlFor="register-confirmation">Confirmar contraseña</label>
            <div className="flex min-h-[45px] items-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-[11px] text-[#98a8bb] focus-within:border-[#7ab2f5] focus-within:shadow-[0_0_0_3px_#dcecff] dark:bg-[#102034]">
              <Icon name="lock" />
              <input autoComplete="new-password" className="min-w-0 flex-1 bg-transparent py-[11px] text-[13px] text-[var(--ry-ink)] outline-none placeholder:text-[#a4b1c0]" id="register-confirmation" minLength={8} name="confirmation" placeholder="Repite tu contraseña" required type={passwordVisible ? 'text' : 'password'} />
              <button aria-label={passwordVisible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} className="grid cursor-pointer place-items-center border-0 bg-transparent p-1 text-[#8c9db1]" onClick={() => setPasswordVisible(!passwordVisible)} type="button"><Icon name="eye" size={18} /></button>
            </div>
            {message && <p className="mt-1 text-xs text-[#b42318] dark:text-[#ffb1b8]" role="alert">{message}</p>}
            <button className="mt-[7px] inline-flex min-h-[47px] w-full items-center justify-center gap-[9px] rounded-[11px] bg-[var(--ry-blue)] px-4 py-[11px] text-[13px] font-bold text-white transition hover:bg-[var(--ry-blue-dark)]" type="submit">Crear cuenta <Icon name="arrow-right" /></button>
          </form>
          <p className="mt-[14px] text-center text-xs">¿Ya tienes cuenta? <button className="cursor-pointer border-0 bg-transparent p-0 font-bold text-[var(--ry-blue)]" onClick={onLogin} type="button">Inicia sesión</button></p>
          <p className="mt-[7px] text-center text-[10px] text-[var(--ry-muted)]">Tu contraseña se guarda protegida en el servidor.</p>
        </div>
        <footer className="grid gap-[5px] px-5 pb-5 pt-[10px] text-center text-[10px] text-[#8c9bae]"><strong className="font-semibold">Instituto Tecnológico de Tijuana</strong><span>Prototipo académico · Comunidad estudiantil</span></footer>
      </section>
    </main>
  )
}
