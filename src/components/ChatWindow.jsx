import { useEffect, useRef } from 'react'
import { MoreHorizontal, Trash2, Bot } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useChat } from '../hooks/useChat.js'
import ChatMessage from './ChatMessage.jsx'
import ChatInput from './ChatInput.jsx'
import EmptyState from './EmptyState.jsx'
import { TypingIndicator } from './LoadingAnimation.jsx'

export default function ChatWindow({ onOpenUpload }) {
  const { messages, currentPDF, setSelectedPage, clearChat, isThinking } = useApp()
  const { sendMessage, error } = useChat()
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking])

  const isReady = currentPDF?.processed

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-100/50 dark:bg-slate-950/50 transition-colors duration-300">
      {/* Header Bar */}
      <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div>
          <h2 className="font-display text-base font-extrabold text-slate-900 dark:text-white">PDF Assistant</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ask questions about your uploaded document</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            disabled={!messages.length}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <Trash2 size={14} /> Clear Chat
          </button>
          <button
            aria-label="More options"
            className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        {!messages.length ? (
          <EmptyState onSuggestion={sendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} onSelectSource={setSelectedPage} />
            ))}
            {isThinking && (
              <div className="flex items-start gap-3 animate-slideUp">
                <div className="w-9 h-9 shrink-0 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold text-xs">
                  <Bot size={17} />
                </div>
                <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-tl-sm px-5 py-4 backdrop-blur-md">
                  <TypingIndicator />
                </div>
              </div>
            )}
            {error && (
              <div className="text-center">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 py-2.5 px-4 rounded-xl inline-block">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Chat Input Area (No Overlap) */}
      <ChatInput onSend={sendMessage} disabled={!isReady || isThinking} onAttach={onOpenUpload} />
    </div>
  )
}


