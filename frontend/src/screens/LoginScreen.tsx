import { FormEvent, useState } from 'react'
import { Brand, Icon } from '../components/Brand'

type LoginScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: () => void
  initialError?: string
}

export function LoginScreen({ onLogin, onRegister, initialError }: LoginScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [message, setMessage] = useState(initialError ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    try {
      await onLogin(String(formData.get('email')), String(formData.get('password')))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_50%_0,#e8f2ff_0,transparent_55%)] p-6 dark:bg-[radial-gradient(ellipse_at_50%_0,#172b42_0,transparent_55%)] max-[430px]:p-0">
      <section aria-labelledby="login-title" className="w-full max-w-[440px] overflow-hidden rounded-[22px] border border-[#e0e8f1] bg-[var(--ry-surface)] shadow-[0_20px_60px_#19345212] dark:border-[var(--ry-card-border)] max-[430px]:min-h-screen max-[430px]:rounded-none max-[430px]:border-0 max-[430px]:shadow-none">
        <header className="border-b border-[#eef2f6] px-[22px] py-[18px] dark:border-[var(--ry-line)]"><Brand /></header>
        <div className="relative flex min-h-[164px] items-center overflow-hidden bg-[var(--ry-blue-soft)] px-[22px] py-5">
          <div className="z-[1] w-[62%]">
            <span className="inline-flex items-center gap-[5px] rounded-full bg-white px-[9px] py-[5px] text-[10px] font-bold text-[var(--ry-blue)] dark:bg-[#243a52]"><Icon name="spark" size={14} /> Tu escuela, mejor</span>
            <h1 className="my-3 max-w-[230px] text-[23px] leading-[1.1] tracking-[-0.6px]">El cambio empieza contigo.</h1>
            <p className="text-[13px] leading-[1.55] text-[var(--ry-muted)]">Reporta y da seguimiento a lo que necesita tu escuela.</p>
          </div>
          <div aria-hidden="true" className="absolute bottom-5 right-3 h-[92px] w-[142px]">
            <span className="absolute right-[10px] top-0 h-[25px] w-[45px] rounded-t-[40px] bg-[#ffdaa0]" />
            <span className="absolute bottom-[17px] right-[6px] flex h-[50px] w-[104px] items-center justify-around border-2 border-[#b4c6dc] bg-[linear-gradient(160deg,#fff_0_48%,#e6eef7_49%)] pt-3 shadow-[5px_5px_0_#c9d7e6] [transform:skewY(-6deg)] before:absolute before:-left-[3px] before:-top-[14px] before:h-[18px] before:w-[105px] before:border-2 before:border-[#cad6e4] before:bg-[#fdfcf8] before:content-[''] before:[transform:skewY(16deg)] [&>span]:h-[17px] [&>span]:w-[17px] [&>span]:border-2 [&>span]:border-[#bdd6f0] [&>span]:bg-[#dbeeff] [&>span:last-child]:h-7 [&>span:last-child]:w-[19px] [&>span:last-child]:self-end [&>span:last-child]:rounded-t-[9px] [&>span:last-child]:bg-[#92b9e6]">
              <span /><span /><span />
            </span>
            <span className="absolute bottom-[3px] left-[21px] h-[21px] w-[92px] rounded-[50%] border-4 border-[#c0aa83] bg-[#e6d3ad]" />
            <span className="absolute bottom-[19px] left-[5px] h-[19px] w-[13px] rounded-[100%_0_100%_0] bg-[#75a982] [transform:rotate(-24deg)]" />
            <span className="absolute bottom-2 right-0 h-[19px] w-[13px] rounded-[100%_0_100%_0] bg-[#75a982] [transform:rotate(38deg)]" />
          </div>
        </div>
        <div className="px-[22px] pb-[18px] pt-6">
          <h2 className="mb-1 text-[25px] tracking-[-0.6px]" id="login-title">¡Qué gusto verte!</h2>
          <p className="text-[13px] leading-[1.55] text-[var(--ry-muted)]">Inicia sesión para consultar tus reportes.</p>
          <form className="mt-5 grid gap-2" onSubmit={handleSubmit}>
            <label className="mt-[7px] text-xs font-bold" htmlFor="login-email">Correo electrónico</label>
            <div className="flex min-h-[45px] items-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-[11px] text-[#98a8bb] focus-within:border-[#7ab2f5] focus-within:shadow-[0_0_0_3px_#dcecff] dark:bg-[#102034]">
              <Icon name="mail" /><input autoComplete="email" className="min-w-0 flex-1 bg-transparent py-[11px] text-[13px] text-[var(--ry-ink)] outline-none placeholder:text-[#a4b1c0]" id="login-email" name="email" placeholder="Escribe tu correo" required type="email" />
            </div>
            <label className="mt-[7px] text-xs font-bold" htmlFor="login-password">Contraseña</label>
            <div className="flex min-h-[45px] items-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-[11px] text-[#98a8bb] focus-within:border-[#7ab2f5] focus-within:shadow-[0_0_0_3px_#dcecff] dark:bg-[#102034]">
              <Icon name="lock" />
              <input autoComplete="current-password" className="min-w-0 flex-1 bg-transparent py-[11px] text-[13px] text-[var(--ry-ink)] outline-none placeholder:text-[#a4b1c0]" id="login-password" name="password" placeholder="Escribe tu contraseña" required type={passwordVisible ? 'text' : 'password'} />
              <button aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="grid cursor-pointer place-items-center border-0 bg-transparent p-1 text-[#8c9db1]" onClick={() => setPasswordVisible(!passwordVisible)} type="button"><Icon name="eye" size={18} /></button>
            </div>
            {message && <p className="mt-1 text-xs text-[#b42318] dark:text-[#ffb1b8]" role="alert">{message}</p>}
            <button className="mt-[7px] inline-flex min-h-[47px] w-full items-center justify-center gap-[9px] rounded-[11px] bg-[var(--ry-blue)] px-4 py-[11px] text-[13px] font-bold text-white transition hover:bg-[var(--ry-blue-dark)] disabled:cursor-wait disabled:opacity-70" disabled={submitting} type="submit">{submitting ? 'Verificando…' : 'Iniciar sesión'} <Icon name="arrow-right" /></button>
          </form>
          <div className="my-[18px] mb-[13px] flex items-center gap-[10px] text-[11px] text-[var(--ry-muted)] before:h-px before:flex-1 before:bg-[#e9eef4] before:content-[''] after:h-px after:flex-1 after:bg-[#e9eef4] after:content-[''] dark:before:bg-[var(--ry-line)] dark:after:bg-[var(--ry-line)]"><span>¿Aún no tienes cuenta?</span></div>
          <button className="inline-flex min-h-[46px] w-full items-center justify-center gap-[9px] rounded-[11px] border border-[var(--ry-line)] bg-white px-4 py-[11px] text-[13px] font-bold text-[var(--ry-blue)] transition hover:border-[#8cbbf2] hover:bg-[#f8fbff] dark:bg-[#1a2b40] dark:hover:bg-[#223852]" onClick={onRegister} type="button">Crear una cuenta <Icon name="user" /></button>
          <p className="mt-3 text-center text-[10px] text-[var(--ry-muted)]">Inicia sesión con la cuenta registrada en ReportaYa.</p>
        </div>
        <footer className="grid gap-[5px] px-5 pb-5 pt-[10px] text-center text-[10px] text-[#8c9bae]"><strong className="font-semibold">Instituto Tecnológico de Tijuana</strong><span>Prototipo académico · Comunidad estudiantil</span></footer>
      </section>
    </main>
  )
}
