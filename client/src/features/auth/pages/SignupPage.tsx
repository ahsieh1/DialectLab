import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import './SignupPage.css'

export function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Signup failed')
        return
      }
      navigate('/login')
    } catch {
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="signup-page">
      <article className="signup-card">
        <div className="signup-card-gradient" aria-hidden="true" />
        <header className="signup-card-logo">
          <span className="signup-card-globe" aria-hidden="true">🌐</span>
          <span className="signup-card-brand">
            Dialect<strong>Lab</strong>
          </span>
        </header>
        <h1 className="signup-card-title">Create your account ✨</h1>
        <p className="signup-card-subtitle">Join the community and start your language journey</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          {error && <p className="signup-form-error" role="alert">{error}</p>}

          <label className="signup-form-label" htmlFor="signup-username">Username</label>
          <input
            className="signup-form-input"
            id="signup-username"
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <label className="signup-form-label" htmlFor="signup-email">Email</label>
          <input
            className="signup-form-input"
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label className="signup-form-label" htmlFor="signup-password">Password</label>
          <input
            className="signup-form-input"
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <label className="signup-form-label" htmlFor="signup-confirm">Confirm Password</label>
          <input
            className="signup-form-input"
            id="signup-confirm"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="signup-form-submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>

          <p className="signup-form-login">
            Already have an account?{' '}
            <Link to="/login">Sign in here.</Link>
          </p>
        </form>
      </article>
    </main>
  )
}
