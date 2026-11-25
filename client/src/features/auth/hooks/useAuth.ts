import { createContext, useContext } from 'react'
import type { AuthSession, AuthUser } from '../api/authApi'

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  status: AuthStatus
  login: (identifier: string, password: string) => Promise<AuthSession>
  logout: () => void
  clearAuth: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
