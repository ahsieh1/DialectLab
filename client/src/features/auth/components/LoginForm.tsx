import { type FormEvent, useState } from 'react'
import { Link } from 'react-router'
import './LoginForm.css'

export type Props = {
  onSubmit: (username: string, password: string) => void
  loading?: boolean
  error?: string
}

export function LoginForm({ onSubmit, loading, error }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(username, password)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="login-form-error" role="alert">{error}</p>}

      <label className="login-form-label" htmlFor="username">
        Username
      </label>
      <input
        className="login-form-input"
        id="username"
        type="text"
        placeholder="your_username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
      />

      <label className="login-form-label" htmlFor="password">
        Password
      </label>
      <div className="login-form-password-wrapper">
        <input
          className="login-form-input"
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          className="login-form-toggle-password"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      <div className="login-form-forgot">
        <Link to="/forgot-password">Forgot password?</Link>
      </div>

      <button
        type="submit"
        className="login-form-submit"
        disabled={loading}
      >
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>

      <div className="login-form-divider">
        <span>or</span>
      </div>

      <p className="login-form-signup">
        Don&apos;t have an account?{' '}
        <Link to="/signup">Create one here.</Link>
      </p>
    </form>
  )
}
