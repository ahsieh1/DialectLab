import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LoginCard } from '../components/LoginCard'
import { LoginForm } from '../components/LoginForm'
import { StatsBar } from '../components/StatsBar'
import './LoginPage.css'

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(username: string, password: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, login: username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }
      localStorage.setItem('token', data.token)
      navigate('/languages')
    } catch {
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <LoginCard>
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        <StatsBar />
      </LoginCard>
    </main>
  )
}
