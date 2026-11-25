import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { LoginCard } from '../components/LoginCard'
import { LoginForm } from '../components/LoginForm'
import { StatsBar } from '../components/StatsBar'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

function readNoticeFromState(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'message' in state) {
    const msg = (state as { message?: unknown }).message
    if (typeof msg === 'string') {
      return msg
    }
  }
  return ''
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { status, user, login, clearAuth } = useAuth()
  const notice = readNoticeFromState(location.state)

  if (status === 'authenticated' && user) {
    return <Navigate to="/languages" replace />
  }

  async function handleLogin(identifier: string, password: string) {
    const trimmedIdentifier = identifier.trim()
    if (!trimmedIdentifier || !password) {
      clearAuth()
      setError('Username or email and password are required')
      return
    }

    setLoading(true)
    setError('')
    try {
      await login(trimmedIdentifier, password)
      navigate('/languages', { replace: true })
    } catch (err) {
      clearAuth()
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <LoginCard>
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
          notice={notice}
        />
        <StatsBar />
      </LoginCard>
    </main>
  )
}
