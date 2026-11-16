import type { Channel } from '../hooks/useChat'
import './ChannelItem.css'

export type Props = {
  channel: Channel
  active: boolean
  onClick: () => void
}

export function ChannelItem({ channel, active, onClick }: Props) {
  return (
    <button
      type="button"
      className={`channel-item ${active ? 'channel-item--active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <span className="channel-item-icon" aria-hidden="true">{channel.icon}</span>
      <span className="channel-item-name"># {channel.name}</span>
    </button>
  )
}
