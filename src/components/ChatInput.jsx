import { useRef, useState } from 'react'
import { Paperclip, SendHorizontal } from 'lucide-react'

export default function ChatInput({ onSend, disabled, onAttach }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSend = () => {
    if (!value.trim() || disabled) return
    onSend(value)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const autoGrow = (e) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
  }

  return (
    <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3.5 transition-colors duration-300">
      <div className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-2 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200">
        <button
          type="button"
          onClick={onAttach}
          aria-label="Attach PDF"
          className="w-10 h-10 shrink-0 grid place-items-center rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-colors focus-ring"
        >
          <Paperclip size={18} />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={autoGrow}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask a question about your PDF..."
          className="flex-1 resize-none bg-transparent text-xs sm:text-sm py-2.5 px-1 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium disabled:cursor-not-allowed max-h-[140px]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="w-10 h-10 shrink-0 grid place-items-center rounded-2xl bg-indigo-600 text-white disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] focus-ring font-bold"
        >
          <SendHorizontal size={18} strokeWidth={2.2} />
        </button>
      </div>
      <p className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono text-[10px]">Shift + Enter</kbd> for line break
      </p>
    </div>
  )
}


