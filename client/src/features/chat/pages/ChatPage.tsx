import { useState } from 'react'
import { useParams } from 'react-router'
import { ChatSidebar } from '../components/ChatSidebar'
import { ChatHeader } from '../components/ChatHeader'
import { MessageList } from '../components/MessageList'
import { MessageInput } from '../components/MessageInput'
import { useChat } from '../hooks/useChat'
import './ChatPage.css'

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  jp: 'Japanese',
  cn: 'Mandarin',
  de: 'German',
  br: 'Portuguese',
  sa: 'Arabic',
  kr: 'Korean',
}

export function ChatPage() {
  const { languageCode = 'es' } = useParams<{ languageCode: string }>()
  const [activeChannel, setActiveChannel] = useState('vocabulary')
  const { messages, channels, loading, onlineCount, sendMessage } = useChat(languageCode, activeChannel)

  const currentChannel = channels.find((ch) => ch.id === activeChannel)
  const languageName = LANGUAGE_NAMES[languageCode] ?? languageCode.toUpperCase()

  return (
    <main className="chat-page">
      <ChatSidebar
        languageCode={languageCode}
        languageName={languageName}
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        onlineCount={onlineCount}
      />
      <section className="chat-page-main">
        <ChatHeader
          channelName={currentChannel?.name ?? activeChannel}
          channelDescription={currentChannel?.description ?? ''}
          onlineCount={onlineCount}
        />
        <MessageList messages={messages} loading={loading} />
        <MessageInput
          channelName={currentChannel?.name ?? activeChannel}
          onSend={sendMessage}
        />
      </section>
    </main>
  )
}
