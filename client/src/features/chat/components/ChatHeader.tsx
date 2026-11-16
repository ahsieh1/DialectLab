import './ChatHeader.css'

export type Props = {
  channelName: string
  channelDescription: string
  onlineCount: number
}

export function ChatHeader({ channelName, channelDescription, onlineCount }: Props) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <h1 className="chat-header-name">
          <span className="chat-header-hash" aria-hidden="true">#</span>
          {channelName}
        </h1>
        <p className="chat-header-description">{channelDescription}</p>
      </div>
      <div className="chat-header-online">
        <span aria-hidden="true">👥</span>
        {onlineCount} online
      </div>
    </header>
  )
}
