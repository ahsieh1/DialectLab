import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  type AuthSession,
  type AuthUser,
  fetchCurrentUser,
  loginUser,
} from '../api/authApi'
import { AuthContext, type AuthStatus } from '../hooks/useAuth'
import './AuthProvider.css'

const TOKEN_STORAGE_KEY = 'token'

export type Props = {
  children: ReactNode
}

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const trimmed = raw.trim()
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      return null
    }
    return trimmed
  } catch {
    return null
  }
}

function saveStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // Storage write failures do not bypass in-memory verified state.
  }
}

function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Ignore storage removal failures in restricted environments.
  }
}

export function AuthProvider({ children }: Props) {
  const [initialToken] = useState<string | null>(() => readStoredToken())
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(initialToken)
  const [status, setStatus] = useState<AuthStatus>(
    initialToken ? 'checking' : 'unauthenticated'
  )
  const sessionVersionRef = useRef(0)

  const clearAuth = useCallback(() => {
    sessionVersionRef.current += 1
    removeStoredToken()
    setUser(null)
    setToken(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    if (!initialToken) {
      return
    }

    const activeToken = initialToken
    const requestVersion = sessionVersionRef.current
    let cancelled = false

    async function verifyStoredSession() {
      try {
        const verifiedUser = await fetchCurrentUser(activeToken)
        if (cancelled || sessionVersionRef.current !== requestVersion) {
          return
        }
        setUser(verifiedUser)
        setToken(activeToken)
        setStatus('authenticated')
      } catch {
        if (cancelled || sessionVersionRef.current !== requestVersion) {
          return
        }
        removeStoredToken()
        setUser(null)
        setToken(null)
        setStatus('unauthenticated')
      }
    }

    void verifyStoredSession()
    return () => {
      cancelled = true
    }
  }, [initialToken])

  const login = useCallback(
    async (identifier: string, password: string): Promise<AuthSession> => {
      sessionVersionRef.current += 1
      const attemptVersion = sessionVersionRef.current
      removeStoredToken()
      setUser(null)
      setToken(null)
      setStatus('unauthenticated')

      try {
        const session = await loginUser({ identifier, password })
        if (sessionVersionRef.current !== attemptVersion) {
          throw new Error('Authentication was superseded')
        }
        saveStoredToken(session.token)
        setUser(session.user)
        setToken(session.token)
        setStatus('authenticated')
        return session
      } catch (error) {
        if (sessionVersionRef.current === attemptVersion) {
          removeStoredToken()
          setUser(null)
          setToken(null)
          setStatus('unauthenticated')
        }
        throw error
      }
    },
    []
  )

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  return (
    <AuthContext.Provider
      value={{ user, token, status, login, logout, clearAuth }}
    >
      <div className="auth-provider-root">{children}</div>
    </AuthContext.Provider>
  )
}
