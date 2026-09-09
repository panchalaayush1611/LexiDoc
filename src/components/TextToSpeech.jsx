import { Volume2, Pause, Square, Play } from 'lucide-react'

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]

function SoundWaveIndicator() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3.5 ml-1" aria-hidden="true">
      <span className="w-[3px] rounded-full bg-indigo-500 dark:bg-indigo-400 animate-soundWave" style={{ animationDelay: '0ms', height: '40%' }} />
      <span className="w-[3px] rounded-full bg-indigo-500 dark:bg-indigo-400 animate-soundWave" style={{ animationDelay: '150ms', height: '70%' }} />
      <span className="w-[3px] rounded-full bg-indigo-500 dark:bg-indigo-400 animate-soundWave" style={{ animationDelay: '300ms', height: '50%' }} />
      <span className="w-[3px] rounded-full bg-indigo-500 dark:bg-indigo-400 animate-soundWave" style={{ animationDelay: '100ms', height: '85%' }} />
    </span>
  )
}

/**
 * Pure presentation component for TTS controls.
 * All speech state and actions are received as props from ChatMessage.
 */
export default function TextToSpeech({ speechState, rate, isSupported, onListen, onPause, onResume, onStop, onChangeRate }) {
  // Don't render anything if the browser doesn't support speech synthesis
  if (!isSupported) return null

  const isIdle = speechState === 'idle'
  const isSpeaking = speechState === 'speaking'
  const isPaused = speechState === 'paused'
  const isActive = isSpeaking || isPaused

  return (
    <div
      className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Text-to-speech controls"
    >
      {/* ── Idle State: Listen Button ── */}
      {isIdle && (
        <button
          onClick={onListen}
          aria-label="Listen to this response"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 focus-ring"
        >
          <Volume2 size={13} />
          Listen
        </button>
      )}

      {/* ── Active State: Pause/Resume + Stop ── */}
      {isActive && (
        <>
          {isSpeaking ? (
            <button
              onClick={onPause}
              aria-label="Pause speech"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 transition-all duration-200 focus-ring"
            >
              <Pause size={12} />
              Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              aria-label="Resume speech"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 transition-all duration-200 focus-ring"
            >
              <Play size={12} />
              Resume
            </button>
          )}

          <button
            onClick={onStop}
            aria-label="Stop speech"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all duration-200 focus-ring"
          >
            <Square size={10} />
            Stop
          </button>

          {/* ── Speed Selector ── */}
          <div className="flex items-center gap-0.5 ml-1 bg-slate-100 dark:bg-slate-800/60 rounded-full p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeRate(speed)}
                aria-label={`Set speech speed to ${speed}x`}
                aria-pressed={rate === speed}
                className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all duration-150 focus-ring min-w-[32px] ${
                  rate === speed
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* ── Sound Wave Indicator ── */}
          {isSpeaking && <SoundWaveIndicator />}
        </>
      )}
    </div>
  )
}
