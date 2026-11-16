import { Link } from 'react-router'
import type { Language } from '../hooks/useLanguages'
import './LanguageCard.css'

export type Props = {
  language: Language
  role: 'learner' | 'helper'
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export function LanguageCard({ language, role }: Props) {
  return (
    <Link
      to={`/chat/${language.code.toLowerCase()}`}
      className="language-card"
      state={{ role }}
    >
      <span className="language-card-code">{language.code}</span>
      <h3 className="language-card-name">{language.name}</h3>
      <p className="language-card-members">
        <span aria-hidden="true">👥</span> {formatCount(language.members)} members
      </p>
      <div className="language-card-badges">
        <span className="language-card-badge language-card-badge--learner">
          {formatCount(language.learners)} Learners
        </span>
        <span className="language-card-badge language-card-badge--helper">
          {formatCount(language.helpers)} Helpers
        </span>
      </div>
    </Link>
  )
}
