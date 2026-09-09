import { Bot, AlertTriangle, User } from 'lucide-react'
import SourceReference from './SourceReference.jsx'
import TextToSpeech from './TextToSpeech.jsx'
import { useTextToSpeech } from '../hooks/useTextToSpeech.js'
import { useApp } from '../context/AppContext.jsx'

/**
 * Renders markdown content with optional word-level highlighting for TTS.
 *
 * @param {string} content - Raw markdown text
 * @param {number|null} highlightWordIndex - The global word index to highlight.
 *   null/undefined = no wrapping (idle). Number = wrap words in spans
 *   (-1 = wrap but no highlight yet, >= 0 = highlight that word).
 */
function renderMarkdown(content, highlightWordIndex) {
  const blocks = content.split(/\n\n+/)
  const nodes = []
  let key = 0

  // Word counter tracks words sequentially across all rendered blocks,
  // EXCLUDING code blocks (which are not spoken). This counter must stay
  // in sync with how stripMarkdown produces clean text words.
  const wordCounter = { current: 0 }
  const shouldWrap = highlightWordIndex !== null && highlightWordIndex !== undefined

  /**
   * Wraps each whitespace-delimited token in a <span>.
   * Only the span matching highlightWordIndex gets the highlight class.
   * When shouldWrap is false, returns raw text for efficient rendering.
   */
  const wrapWords = (text) => {
    if (!shouldWrap) return text
    const tokens = text.split(/(\s+)/g)
    return tokens.map((token, i) => {
      if (/^\s*$/.test(token)) return token
      const idx = wordCounter.current++
      return (
        <span
          key={i}
          className={idx === highlightWordIndex ? 'tts-word-highlight' : undefined}
        >
          {token}
        </span>
      )
    })
  }

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">{wrapWords(part.slice(2, -2))}</strong>
      ) : (
        <span key={i}>{wrapWords(part)}</span>
      )
    )
  }

  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean)
    if (block.startsWith('```')) {
      // Code blocks are NOT spoken — skip word counting entirely
      const code = block.replace(/```[a-z]*\n?/, '').replace(/```$/, '')
      nodes.push(
        <pre key={key++} className="bg-slate-900 text-slate-100 text-xs rounded-xl p-3.5 overflow-x-auto my-2 border border-slate-800 font-mono">
          <code>{code}</code>
        </pre>
      )
    } else if (/^#{1,3}\s/.test(lines[0] || '')) {
      const level = lines[0].match(/^(#{1,3})/)[1].length
      const text = lines[0].replace(/^#{1,3}\s/, '')
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5'
      nodes.push(
        <Tag key={key++} className="font-display font-bold mt-3 mb-1 text-slate-900 dark:text-white text-base">
          {renderInline(text)}
        </Tag>
      )
    } else if (lines.every((l) => /^\d+\.\s/.test(l))) {
      nodes.push(
        <ol key={key++} className="list-decimal list-inside space-y-1.5 my-2 marker:text-indigo-500 marker:font-bold">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\d+\.\s/, ''))}</li>
          ))}
        </ol>
      )
    } else if (lines.every((l) => /^[-•]\s/.test(l))) {
      nodes.push(
        <ul key={key++} className="list-disc list-inside space-y-1.5 my-2 marker:text-indigo-500">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^[-•]\s/, ''))}</li>
          ))}
        </ul>
      )
    } else {
      nodes.push(
        <p key={key++} className="leading-relaxed">
          {renderInline(block)}
        </p>
      )
    }
  }

  return nodes
}

export default function ChatMessage({ message, onSelectSource }) {
  const isUser = message.role === 'user'
  const { user } = useApp() || {}
  // Hook is called unconditionally (rules of hooks) but only used for assistant messages
  const tts = useTextToSpeech(message.id)

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2.5 animate-slideUp">
        <div className="max-w-[85%] sm:max-w-[70%] bg-indigo-600 text-white font-medium rounded-3xl rounded-br-sm px-5 py-3.5 text-xs sm:text-sm leading-relaxed">
          {message.content}
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 grid place-items-center shrink-0 text-indigo-600 dark:text-indigo-400 overflow-hidden shadow-xs">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name || 'User'} className="w-full h-full object-cover" />
          ) : user?.avatar ? (
            <span className="font-bold text-xs">{user.avatar}</span>
          ) : (
            <User size={15} />
          )}
        </div>
      </div>
    )
  }

  // When TTS is active (speaking or paused), pass the word index for highlighting.
  // null = idle (no word wrapping). -1 = active but before first onboundary. >= 0 = highlight that word.
  const highlightWordIndex = tts.speechState !== 'idle' ? tts.activeWordIndex : null

  return (
    <div className="flex items-start gap-3 animate-slideUp">
      <div
        className={`w-9 h-9 shrink-0 rounded-2xl grid place-items-center ${
          message.isError
            ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            : 'bg-indigo-600 text-white'
        }`}
      >
        {message.isError ? <AlertTriangle size={17} /> : <Bot size={17} />}
      </div>
      <div className="max-w-[90%] sm:max-w-[75%] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-tl-sm px-5 py-4 text-xs sm:text-sm text-slate-800 dark:text-slate-100 backdrop-blur-md">
        <div className="space-y-2">{renderMarkdown(message.content, highlightWordIndex)}</div>
        {!message.isError && (
          <TextToSpeech
            speechState={tts.speechState}
            rate={tts.rate}
            isSupported={tts.isSupported}
            onListen={() => tts.speak(message.content)}
            onPause={tts.pause}
            onResume={tts.resume}
            onStop={tts.stop}
            onChangeRate={tts.changeRate}
          />
        )}
        {!message.isError && <SourceReference sources={message.sources} onSelect={onSelectSource} />}
      </div>
    </div>
  )
}
