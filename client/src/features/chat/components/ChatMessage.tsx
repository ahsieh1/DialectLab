import type { Message } from '../hooks/useChat'
import './ChatMessage.css'

export type Props = {
  message: Message
}

const AVATAR_COLORS = [
  '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#f39c12',
  '#1abc9c', '#e67e22', '#e91e63',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function ChatMessage({ message }: Props) {
  if (message.isOwn) {
    return (
      <article className="chat-message chat-message--own">
        <div className="chat-message-own-bubble">
          <p className="chat-message-text">{message.text}</p>
        </div>
        <time className="chat-message-time chat-message-time--own">{message.timestamp}</time>
      </article>
    )
  }

  const initial = message.username.charAt(0).toUpperCase()
  const avatarColor = getAvatarColor(message.username)

  return (
    <article className="chat-message">
      <div
        className="chat-message-avatar"
        style={{ background: avatarColor }}
        aria-hidden="true"
      >
        {initial}
      </div>
      <div className="chat-message-content">
        <header className="chat-message-meta">
          <span className="chat-message-username">{message.username}</span>
          <span className={`chat-message-role chat-message-role--${message.role}`}>
            {message.role === 'helper' ? 'Helper' : 'Learner'}
          </span>
          <time className="chat-message-time">{message.timestamp}</time>
        </header>
        <div className="chat-message-bubble">
          <p className="chat-message-text">{message.text}</p>
        </div>
      </div>
    </article>
  )
}
