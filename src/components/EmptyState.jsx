import { Sparkles, MessageSquareText, FileSearch, HelpCircle } from 'lucide-react'

const DEFAULT_SUGGESTIONS = [
  { text: 'Summarize this document', icon: MessageSquareText },
  { text: 'What are the key points?', icon: Sparkles },
  { text: 'Explain the main concepts', icon: FileSearch },
  { text: 'Give me important conclusions', icon: HelpCircle },
]

export default function EmptyState({ onSuggestion }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center animate-fadeIn my-auto">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white grid place-items-center mb-6 font-bold hover:scale-105 transition-transform">
        <Sparkles size={30} />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
        What would you like to know?
      </h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-9 max-w-md leading-relaxed font-medium">
        Ask questions about the content of your PDF document and LexiDoc will pinpoint exact answers with citations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {DEFAULT_SUGGESTIONS.map(({ text: s, icon: Icon }) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="flex items-center gap-3 text-left text-xs font-semibold p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:-translate-y-0.5 focus-ring group"
          >
            <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
              <Icon size={16} />
            </span>
            <span className="flex-1">{s}</span>
          </button>
        ))}
      </div>
    </div>
  )
}


