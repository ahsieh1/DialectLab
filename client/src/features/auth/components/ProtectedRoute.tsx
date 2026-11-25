import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import './ProtectedRoute.css'

export type Props = {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { status, user, token } = useAuth()

  if (status === 'checking') {
    return (
      <main className="protected-route-loading" role="status">
        <p>Verifying session…</p>
      </main>
    )
  }

  if (status !== 'authenticated' || !user || !token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
