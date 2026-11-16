import './RoleToggle.css'

export type Props = {
  role: 'learner' | 'helper'
  onChange: (role: 'learner' | 'helper') => void
}

export function RoleToggle({ role, onChange }: Props) {
  return (
    <div className="role-toggle" role="radiogroup" aria-label="Select your role">
      <button
        type="button"
        className={`role-toggle-btn ${role === 'learner' ? 'role-toggle-btn--active' : ''}`}
        role="radio"
        aria-checked={role === 'learner'}
        onClick={() => onChange('learner')}
      >
        <span aria-hidden="true">💫</span> I want to Learn
      </button>
      <button
        type="button"
        className={`role-toggle-btn ${role === 'helper' ? 'role-toggle-btn--active' : ''}`}
        role="radio"
        aria-checked={role === 'helper'}
        onClick={() => onChange('helper')}
      >
        <span aria-hidden="true">♡</span> Help others learn
      </button>
    </div>
  )
}
