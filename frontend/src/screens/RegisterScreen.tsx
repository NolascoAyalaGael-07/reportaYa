import { FormEvent, useState } from 'react'
import { Brand, Icon } from '../components/Brand'

type RegisterScreenProps = {
  onCreateAccount: (name: string, controlNumber: string, email: string) => void
  onLogin: () => void
}

export function RegisterScreen({ onCreateAccount, onLogin }: RegisterScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password'))
    const confirmation = String(formData.get('confirmation'))

    if (password !== confirmation) {
      setMessage('Las contraseñas no coinciden. Verifica e inténtalo de nuevo.')
      return
    }

    onCreateAccount(
      String(formData.get('name')).trim(),
      String(formData.get('controlNumber')).trim(),
      String(formData.get('email')).trim(),
    )
  }

  return (
    <main className="ry-auth-layout">
      <section className="ry-auth-card ry-register-card" aria-labelledby="register-title">
        <header className="ry-auth-header ry-register-header">
          <Brand />
          <button aria-label="Volver al inicio de sesión" className="ry-back-button" onClick={onLogin} type="button"><Icon name="arrow-left" /></button>
        </header>
        <div className="ry-auth-content ry-register-content">
          <h1 id="register-title">Súmate al cambio</h1>
          <p>Crea tu cuenta y ayuda a cuidar los espacios que compartimos.</p>
          <div className="ry-role-banner"><Icon name="spark" size={17} /> Cuenta de estudiante</div>
          <form className="ry-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Nombre completo</label>
            <div className="ry-input-wrap"><Icon name="user" /><input autoComplete="name" id="register-name" name="name" placeholder="Tu nombre y apellidos" required /></div>
            <label htmlFor="register-control">Número de control</label>
            <div className="ry-input-wrap"><Icon name="reports" /><input autoComplete="off" id="register-control" name="controlNumber" placeholder="Ej. 23210000" required /></div>
            <label htmlFor="register-email">Correo electrónico</label>
            <div className="ry-input-wrap"><Icon name="mail" /><input autoComplete="email" id="register-email" name="email" placeholder="nombre@ejemplo.com" required type="email" /></div>
            <label htmlFor="register-password">Contraseña</label>
            <div className="ry-input-wrap">
              <Icon name="lock" />
              <input autoComplete="new-password" id="register-password" minLength={8} name="password" placeholder="Crea una contraseña" required type={passwordVisible ? 'text' : 'password'} />
              <button aria-label={passwordVisible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} className="ry-icon-button" onClick={() => setPasswordVisible(!passwordVisible)} type="button"><Icon name="eye" size={18} /></button>
            </div>
            <small className="ry-field-hint">Usa al menos 8 caracteres.</small>
            <label htmlFor="register-confirmation">Confirmar contraseña</label>
            <div className="ry-input-wrap">
              <Icon name="lock" />
              <input autoComplete="new-password" id="register-confirmation" minLength={8} name="confirmation" placeholder="Repite tu contraseña" required type={passwordVisible ? 'text' : 'password'} />
              <button aria-label={passwordVisible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} className="ry-icon-button" onClick={() => setPasswordVisible(!passwordVisible)} type="button"><Icon name="eye" size={18} /></button>
            </div>
            {message && <p className="ry-form-message" role="alert">{message}</p>}
            <button className="ry-button ry-button--primary ry-auth-submit" type="submit">Crear cuenta <Icon name="arrow-right" /></button>
          </form>
          <p className="ry-register-login">¿Ya tienes cuenta? <button onClick={onLogin} type="button">Inicia sesión</button></p>
          <p className="ry-auth-note">Prototipo académico: los datos no se envían ni guardan.</p>
        </div>
        <footer className="ry-auth-footer"><strong>Instituto Tecnológico de Tijuana</strong><span>Prototipo académico · Comunidad estudiantil</span></footer>
      </section>
    </main>
  )
}
