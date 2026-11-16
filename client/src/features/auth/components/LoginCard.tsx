import type { ReactNode } from 'react'
import './LoginCard.css'

export type Props = {
  children: ReactNode
}

export function LoginCard({ children }: Props) {
  return (
    <article className="login-card">
      <div className="login-card-gradient" aria-hidden="true" />
      <header className="login-card-logo">
        <span className="login-card-globe" aria-hidden="true">🌐</span>
        <span className="login-card-brand">
          Dialect<strong>Lab</strong>
        </span>
      </header>
      <h1 className="login-card-title">Welcome back! 👋</h1>
      <p className="login-card-subtitle">Sign in to continue your language journey</p>
      {children}
    </article>
  )
}
