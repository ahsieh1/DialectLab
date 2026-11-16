import { Link } from 'react-router'
import type { Channel } from '../hooks/useChat'
import { ChannelItem } from './ChannelItem'
import './ChatSidebar.css'

export type Props = {
  languageCode: string
  languageName: string
  channels: Channel[]
  activeChannel: string
  onChannelSelect: (id: string) => void
  onlineCount: number
}

export function ChatSidebar({
  languageCode,
  languageName,
  channels,
  activeChannel,
  onChannelSelect,
  onlineCount,
}: Props) {
  return (
    <aside className="chat-sidebar">
      <header className="chat-sidebar-header">
        <span className="chat-sidebar-code">{languageCode.toUpperCase()}</span>
        <span className="chat-sidebar-lang">{languageName}</span>
        <span className="chat-sidebar-community">Community</span>
      </header>

      <nav className="chat-sidebar-channels" aria-label="Channels">
        <h2 className="chat-sidebar-section-title">Channels</h2>
        <ul className="chat-sidebar-channel-list">
          {channels.map((ch) => (
            <li key={ch.id}>
              <ChannelItem
                channel={ch}
                active={ch.id === activeChannel}
                onClick={() => onChannelSelect(ch.id)}
              />
            </li>
          ))}
        </ul>
      </nav>

      <footer className="chat-sidebar-footer">
        <p className="chat-sidebar-online">
          <span className="chat-sidebar-online-dot" aria-hidden="true" />
          {onlineCount} online now
        </p>
        <Link to="/languages" className="chat-sidebar-change">
          ← Change Language
        </Link>
      </footer>
    </aside>
  )
}
