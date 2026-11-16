import type { Language } from '../hooks/useLanguages'
import { LanguageCard } from './LanguageCard'
import './LanguageGrid.css'

export type Props = {
  languages: Language[]
  role: 'learner' | 'helper'
}

export function LanguageGrid({ languages, role }: Props) {
  return (
    <section className="language-grid" aria-label="Available languages">
      {languages.map((lang) => (
        <LanguageCard key={lang.code} language={lang} role={role} />
      ))}
    </section>
  )
}
