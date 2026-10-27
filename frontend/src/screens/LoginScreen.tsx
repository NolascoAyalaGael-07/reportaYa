import { FormEvent, useState } from 'react'
import { Brand, Icon } from '../components/Brand'

type LoginScreenProps = {
  onLogin: (email: string, password: string) => void
  onRegister: () => void
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onLogin(String(formData.get('email')), String(formData.get('password')))
  }

  return (
    <main className="ry-auth-layout">
      <section className="ry-auth-card" aria-labelledby="login-title">
        <header className="ry-auth-header"><Brand /></header>
        <div className="ry-welcome">
          <div className="ry-welcome-copy">
            <span className="ry-eyebrow"><Icon name="spark" size={14} /> Tu escuela, mejor</span>
            <h1>El cambio empieza contigo.</h1>
            <p>Reporta y da seguimiento a lo que necesita tu escuela.</p>
          </div>
          <div className="ry-campus-art" aria-hidden="true">
            <span className="ry-campus-sun" />
            <span className="ry-campus-building"><span /><span /><span /></span>
            <span className="ry-campus-path" />
            <span className="ry-campus-plant ry-campus-plant--one" />
            <span className="ry-campus-plant ry-campus-plant--two" />
          </div>
        </div>
        <div className="ry-auth-content">
          <h2 id="login-title">¡Qué gusto verte!</h2>
          <p>Inicia sesión para consultar tus reportes.</p>
          <form className="ry-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Correo electrónico</label>
            <div className="ry-input-wrap"><Icon name="mail" /><input autoComplete="email" id="login-email" name="email" placeholder="Escribe tu correo" required type="email" /></div>
            <label htmlFor="login-password">Contraseña</label>
            <div className="ry-input-wrap">
              <Icon name="lock" />
              <input autoComplete="current-password" id="login-password" name="password" placeholder="Escribe tu contraseña" required type={passwordVisible ? 'text' : 'password'} />
              <button aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="ry-icon-button" onClick={() => setPasswordVisible(!passwordVisible)} type="button"><Icon name="eye" size={18} /></button>
            </div>
            <button className="ry-button ry-button--primary ry-auth-submit" type="submit">Iniciar sesión <Icon name="arrow-right" /></button>
          </form>
          <div className="ry-divider"><span>¿Aún no tienes cuenta?</span></div>
          <button className="ry-button ry-button--outline ry-auth-register" onClick={onRegister} type="button">Crear una cuenta <Icon name="user" /></button>
          <p className="ry-auth-note">Demostración local: usa cualquier correo válido y una contraseña. No se guarda ningún dato.</p>
        </div>
        <footer className="ry-auth-footer"><strong>Instituto Tecnológico de Tijuana</strong><span>Prototipo académico · Comunidad estudiantil</span></footer>
      </section>
    </main>
  )
}
