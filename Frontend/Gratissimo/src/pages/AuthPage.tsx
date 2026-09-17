import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

const apiUrl = import.meta.env.VITE_API_URL

type Mode = 'login' | 'register'

type AuthFieldProps = {
  label: string
  value: string
  placeholder: string
  type?: 'email' | 'password' | 'text'
  required?: boolean
  onChange: (value: string) => void
}

function AuthField({
  label,
  value,
  placeholder,
  type = 'text',
  required = false,
  onChange,
}: AuthFieldProps) {
  return (
    <label>
      {label}
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

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

    try {
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
    } catch {
      setError('Der kunne ikke oprettes forbindelse til serveren.')
    }
  }

  return (
    <section className="auth-page">
      <section className="auth-intro">
        <h1>Log ind eller opret dig som bruger</h1>
        <p>
          Når du opretter en profil på Gratissimo får du adgang til at oprette,
          slette og redigere i jobannoncer. Som privatperson får du mulighed for
          at gemme de jobs du kunne være interesseret i.
        </p>
        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
        >
          Log ind for at gå til min side
        </button>
      </section>

      <section className="auth-form-section">
        <h2>{mode === 'login' ? 'Log ind' : 'Opret ny profil'}</h2>
        <form className="auth-form" onSubmit={submit}>
          <AuthField
            label="Email"
            type="email"
            required
            placeholder="Skriv din email..."
            value={form.email}
            onChange={(value) => updateField('email', value)}
          />
          <AuthField
            label="Password"
            type="password"
            required
            placeholder="Skriv dit password..."
            value={form.password}
            onChange={(value) => updateField('password', value)}
          />
          {mode === 'register' && (
            <>
              <AuthField
                label="Gentag password"
                type="password"
                required
                placeholder="Skriv dit password..."
                value={form.confirmPassword}
                onChange={(value) => updateField('confirmPassword', value)}
              />
              <AuthField
                label="Fornavn"
                required
                placeholder="Skriv dit fornavn..."
                value={form.firstname}
                onChange={(value) => updateField('firstname', value)}
              />
              <AuthField
                label="Efternavn"
                required
                placeholder="Skriv dit efternavn..."
                value={form.lastname}
                onChange={(value) => updateField('lastname', value)}
              />
              <AuthField
                label="Telefon nummer"
                placeholder="Skriv dit telefon nummer..."
                value={form.phone}
                onChange={(value) => updateField('phone', value)}
              />
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
