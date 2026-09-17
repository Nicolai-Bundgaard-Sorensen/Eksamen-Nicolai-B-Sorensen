import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

const apiUrl = import.meta.env.VITE_API_URL

type Mode = 'login' | 'register'

function AuthPage() {
  const { setSession } = useAuth()
  const [mode, setMode] = useState<Mode>(() => (
    new URLSearchParams(window.location.search).get('mode') === 'register'
      ? 'register'
      : 'login'
  ))
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const fields = mode === 'login'
      ? { username: form.email, password: form.password }
      : Object.fromEntries(
        Object.entries(form)
          .filter(([field, value]) => field !== 'confirmPassword' && value !== ''),
      )

    const response = await fetch(`${apiUrl}/api/${mode === 'login' ? 'login' : 'users'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields),
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error)
      return
    }

    if (mode === 'login') {
      setSession(data.accessToken, data.refreshToken, data.user)
      window.history.pushState({}, '', '/min-side')
      window.dispatchEvent(new Event('locationchange'))
      return
    }

    setMode('login')
  }

  return (
    <section className="auth-page">
      <section className="auth-intro">
        <h1>Log ind eller opret dig som bruger</h1>
        <p>Når du opretter en profil på Gratissimo får du adgang til at oprette, slette og redigere i jobannoncer. Som privatperson får du mulighed for at gemme de jobs du kunne være interesseret i.</p>
        <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
          Log ind for at gå til min side
        </button>
      </section>

      <section className="auth-form-section">
        <h2>{mode === 'login' ? 'Log ind' : 'Opret ny profil'}</h2>
        <form className="auth-form" onSubmit={submit}>
          <label>Email<input required type="email" placeholder="Skriv din email..." value={form.email} onChange={(event) => updateField('email', event.target.value)} /></label>
          <label>Password<input required type="password" placeholder="Skriv dit password..." value={form.password} onChange={(event) => updateField('password', event.target.value)} /></label>
          {mode === 'register' && (
            <>
              <label>Gentag password<input required type="password" placeholder="Skriv dit password..." value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} /></label>
              <label>Fornavn<input required placeholder="Skriv dit fornavn..." value={form.firstname} onChange={(event) => updateField('firstname', event.target.value)} /></label>
              <label>Efternavn<input required placeholder="Skriv dit efternavn..." value={form.lastname} onChange={(event) => updateField('lastname', event.target.value)} /></label>
              <label>Telefon nummer<input placeholder="Skriv dit telefon nummer..." value={form.phone} onChange={(event) => updateField('phone', event.target.value)} /></label>
            </>
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">{mode === 'login' ? 'Log ind' : 'Opret profil'}</button>
        </form>
        <button className="auth-switch" type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Opret bruger' : 'Log ind'}
        </button>
      </section>
    </section>
  )
}

export default AuthPage
