import { useState } from 'react'
import { RoleToggle } from '../components/RoleToggle'
import { LanguageGrid } from '../components/LanguageGrid'
import { useLanguages } from '../hooks/useLanguages'
import './LanguageSelectPage.css'

export function LanguageSelectPage() {
  const [role, setRole] = useState<'learner' | 'helper'>('learner')
  const { data: languages, loading, error } = useLanguages()

  return (
    <main className="language-select-page">
      <header className="language-select-header">
        <h1 className="language-select-title">
          Choose Your Language Journey <span aria-hidden="true">🗺️</span>
        </h1>
        <p className="language-select-subtitle">
          Select a language to join its community — whether you&apos;re learning or helping others
        </p>
        <RoleToggle role={role} onChange={setRole} />
      </header>

      {loading && <p className="language-select-loading">Loading languages…</p>}
      {error && <p className="language-select-error" role="alert">{error}</p>}
      {!loading && !error && <LanguageGrid languages={languages} role={role} />}
    </main>
  )
}
