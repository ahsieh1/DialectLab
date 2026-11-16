import './StatsBar.css'

export type Props = {
  stats?: { icon: string; label: string }[]
}

export function StatsBar({ stats }: Props) {
  const defaultStats = [
    { icon: '🌐', label: '10+ Languages' },
    { icon: '👥', label: '50k+ Members' },
    { icon: '📖', label: 'Free to join' },
  ]

  const items = stats ?? defaultStats

  return (
    <footer className="stats-bar">
      {items.map((stat) => (
        <span key={stat.label} className="stats-bar-item">
          <span className="stats-bar-icon" aria-hidden="true">{stat.icon}</span>
          {stat.label}
        </span>
      ))}
    </footer>
  )
}
