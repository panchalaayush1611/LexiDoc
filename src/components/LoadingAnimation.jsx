export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
      <span>LexiDoc is thinking</span>
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounceDot" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounceDot" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounceDot" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  )
}

export function Spinner({ size = 16, className = '' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export default function LoadingAnimation({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold" role="status" aria-live="polite">
      <Spinner />
      <span>{label}</span>
    </div>
  )
}
