import { FileText } from 'lucide-react'

export default function SourceReference({ sources, onSelect }) {
  if (!sources?.length) return null

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Sources</p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s) => (
          <button
            key={s.page}
            onClick={() => onSelect?.(s.page)}
            title={s.content}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors focus-ring"
          >
            <FileText size={12} />
            Page {s.page}
          </button>
        ))}
      </div>
    </div>
  )
}

