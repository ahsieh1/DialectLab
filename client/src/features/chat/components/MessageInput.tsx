import { type FormEvent, useState } from 'react'
import './MessageInput.css'

export type Props = {
  channelName: string
  onSend: (text: string) => void
}

export function MessageInput({ channelName, onSend }: Props) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <span className="message-input-icon" aria-hidden="true">🌐</span>
      <input
        className="message-input-field"
        type="text"
        placeholder={`Message #${channelName}...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={`Send a message to ${channelName}`}
      />
      <button
        type="submit"
        className="message-input-send"
        aria-label="Send message"
        disabled={!text.trim()}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
        </svg>
      </button>
    </form>
  )
}
