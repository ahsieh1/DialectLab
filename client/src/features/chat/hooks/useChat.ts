import { useState, useEffect } from 'react'

export type Message = {
  id: string
  username: string
  role: 'helper' | 'learner'
  text: string
  timestamp: string
  isOwn?: boolean
}

export type Channel = {
  id: string
  name: string
  icon: string
  description?: string
}

const MOCK_CHANNELS: Channel[] = [
  { id: 'general', name: 'general', icon: '💬', description: 'General discussion for all topics' },
  { id: 'introductions', name: 'introductions', icon: '👋', description: 'Introduce yourself to the community' },
  { id: 'grammar-help', name: 'grammar-help', icon: '📘', description: 'Grammar questions and explanations' },
  { id: 'vocabulary', name: 'vocabulary', icon: '📝', description: 'Word of the day, vocab tips and tricks' },
  { id: 'culture', name: 'culture', icon: '🎭', description: 'Cultural insights and traditions' },
  { id: 'pronunciation', name: 'pronunciation', icon: '🎙️', description: 'Pronunciation practice and tips' },
  { id: 'resources', name: 'resources', icon: '📚', description: 'Useful learning resources and tools' },
]

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    username: 'tomoko_helper',
    role: 'helper',
    text: '📖 Word of the Day: 木漏れ日 (komorebi) — the interplay of light and leaves when sunlight filters through trees. Japanese has so many beautiful words!',
    timestamp: '8:00 AM',
  },
  {
    id: '2',
    username: 'alex_learns',
    role: 'learner',
    text: 'Wow I love this word. English really does not have an equivalent for it',
    timestamp: '8:14 AM',
  },
  {
    id: '3',
    username: 'hana_jp',
    role: 'learner',
    text: 'These untranslatable words are my favorite part of learning Japanese 🌿',
    timestamp: '8:22 AM',
  },
  {
    id: '4',
    username: 'you',
    role: 'learner',
    text: 'Can you use this in a sentence? Like would you say 木漏れ日が美しい？',
    timestamp: '8:30 AM',
    isOwn: true,
  },
  {
    id: '5',
    username: 'tomoko_helper',
    role: 'helper',
    text: 'Perfect sentence! 木漏れ日が美しい = "The komorebi is beautiful." You could also say 木漏れ日の中を歩く — "to walk through the komorebi" 🌳',
    timestamp: '8:33 AM',
  },
]

export function useChat(languageCode: string, channelId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [channels] = useState<Channel[]>(MOCK_CHANNELS)
  const [loading, setLoading] = useState(true)
  const [error, _setError] = useState('')
  const [onlineCount] = useState(512)

  useEffect(() => {
    let cancelled = false
    async function fetchMessages() {
      setLoading(true)
      try {
        const res = await fetch(`/api/chat/${languageCode}/${channelId}/messages`)
        if (res.ok) {
          const json = await res.json() as Message[]
          if (!cancelled) setMessages(json)
        } else {
          if (!cancelled) setMessages(MOCK_MESSAGES)
        }
      } catch {
        if (!cancelled) setMessages(MOCK_MESSAGES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMessages()
    return () => { cancelled = true }
  }, [languageCode, channelId])

  function sendMessage(text: string) {
    const newMsg: Message = {
      id: String(Date.now()),
      username: 'you',
      role: 'learner',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      isOwn: true,
    }
    setMessages((prev) => [...prev, newMsg])
  }

  return { messages, channels, loading, error, onlineCount, sendMessage }
}
