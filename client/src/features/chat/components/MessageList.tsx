import { useEffect, useRef } from 'react'
import type { Message } from '../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import './MessageList.css'

export type Props = {
  messages: Message[]
  loading: boolean
}

export function MessageList({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <section className="message-list" aria-label="Messages">
        <p className="message-list-loading">Loading messages…</p>
      </section>
    )
  }

  return (
    <section className="message-list" aria-label="Messages">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </section>
  )
}
