import { useState, useCallback, useRef, useEffect } from 'react'
import { stripMarkdown, splitIntoChunks } from '../utils/stripMarkdown.js'

// ── Module-level singleton state ──
// Ensures only one message speaks at a time across all component instances.
let activeMessageId = null
let activeStopFn = null

/**
 * Custom hook for Web Speech API text-to-speech with word-level tracking.
 * Uses event-driven chunk playback so speed changes take effect immediately.
 * Exposes activeWordIndex via the onboundary event for real-time word highlighting.
 *
 * @param {string} messageId - Unique ID of the chat message
 * @returns {{ speechState, rate, activeWordIndex, isSupported, speak, pause, resume, stop, changeRate }}
 */
export function useTextToSpeech(messageId) {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [speechState, setSpeechState] = useState('idle') // 'idle' | 'speaking' | 'paused'
  const [rate, setRate] = useState(1)
  const [activeWordIndex, setActiveWordIndex] = useState(-1)

  const rateRef = useRef(1)
  const chunksRef = useRef([])
  const chunkWordOffsetsRef = useRef([])
  const currentIndexRef = useRef(0)
  const utteranceRef = useRef(null)
  const isCancelledRef = useRef(false)
  const isRateChangeRef = useRef(false)

  // Reset this instance's state
  const resetSelf = useCallback(() => {
    setSpeechState('idle')
    setActiveWordIndex(-1)
    chunksRef.current = []
    chunkWordOffsetsRef.current = []
    currentIndexRef.current = 0
    utteranceRef.current = null
    isCancelledRef.current = false
    isRateChangeRef.current = false
  }, [])

  /**
   * Speaks the chunk at currentIndexRef using rateRef.
   * When the chunk finishes, automatically advances to the next chunk.
   * On rate change, restarts the same chunk with the new rate.
   * Fires onboundary to track the currently-spoken word index.
   */
  const speakCurrentChunk = useCallback(() => {
    const idx = currentIndexRef.current
    const chunks = chunksRef.current

    // All chunks done — reset to idle
    if (idx >= chunks.length || isCancelledRef.current) {
      if (activeMessageId === messageId) {
        activeMessageId = null
        activeStopFn = null
      }
      if (!isCancelledRef.current) {
        resetSelf()
      }
      return
    }

    const utterance = new SpeechSynthesisUtterance(chunks[idx])
    utterance.rate = rateRef.current
    utterance.lang = 'en-US'
    utteranceRef.current = utterance

    utterance.onstart = () => {
      if (!isCancelledRef.current) {
        setSpeechState('speaking')
      }
    }

    // Word boundary tracking — fires at the start of each spoken word.
    // Maps the charIndex within the current chunk to a global word index
    // that matches the sequential word count in the rendered markdown.
    utterance.onboundary = (event) => {
      if (event.name === 'word' && !isCancelledRef.current) {
        const chunkText = chunks[currentIndexRef.current]
        const chunkOffset = chunkWordOffsetsRef.current[currentIndexRef.current] || 0
        // Count whitespace-delimited tokens before the current charIndex
        const textBefore = chunkText.slice(0, event.charIndex)
        const wordsBefore = (textBefore.match(/\S+/g) || []).length
        setActiveWordIndex(chunkOffset + wordsBefore)
      }
    }

    utterance.onend = () => {
      if (isCancelledRef.current) return
      // Advance to next chunk
      currentIndexRef.current++
      speakCurrentChunk()
    }

    utterance.onerror = () => {
      // Rate change: restart the SAME chunk with the new rate
      if (isRateChangeRef.current) {
        isRateChangeRef.current = false
        speakCurrentChunk()
        return
      }
      // User-initiated stop or switching messages — do nothing here,
      // stop() already handles cleanup
      if (isCancelledRef.current) return
      // Real unexpected error — reset to idle
      if (activeMessageId === messageId) {
        activeMessageId = null
        activeStopFn = null
      }
      resetSelf()
    }

    utterance.onpause = () => {
      if (!isCancelledRef.current) {
        setSpeechState('paused')
      }
    }

    utterance.onresume = () => {
      if (!isCancelledRef.current) {
        setSpeechState('speaking')
      }
    }

    window.speechSynthesis.speak(utterance)
  }, [messageId, resetSelf])

  /**
   * Stop playback for this message instance.
   */
  const stop = useCallback(() => {
    isCancelledRef.current = true
    isRateChangeRef.current = false
    window.speechSynthesis?.cancel()
    if (activeMessageId === messageId) {
      activeMessageId = null
      activeStopFn = null
    }
    resetSelf()
  }, [messageId, resetSelf])

  /**
   * Start speaking the given text for this message.
   * Automatically stops any other currently-speaking message.
   */
  const speak = useCallback((text) => {
    if (!isSupported || !text) return

    // Stop any currently-speaking message (could be this one or another)
    if (activeMessageId && activeStopFn) {
      activeStopFn()
    }
    window.speechSynthesis.cancel()

    // Register this message as active
    activeMessageId = messageId
    isCancelledRef.current = false
    isRateChangeRef.current = false

    const cleanText = stripMarkdown(text)
    const chunks = splitIntoChunks(cleanText)
    chunksRef.current = chunks

    // Precompute the starting word index for each chunk so onboundary
    // can map its local charIndex to a global word index.
    let wordOffset = 0
    const offsets = chunks.map((chunk) => {
      const offset = wordOffset
      const words = chunk.match(/\S+/g) || []
      wordOffset += words.length
      return offset
    })
    chunkWordOffsetsRef.current = offsets

    currentIndexRef.current = 0
    setActiveWordIndex(-1)

    // Register stop function for singleton enforcement
    activeStopFn = stop

    // Start playback from the first chunk
    speakCurrentChunk()
  }, [isSupported, messageId, stop, speakCurrentChunk])

  /**
   * Change the speech rate. If currently speaking, cancels and restarts
   * the current chunk at the new rate immediately.
   */
  const changeRate = useCallback((newRate) => {
    setRate(newRate)
    rateRef.current = newRate

    // If this message is actively speaking, restart current chunk at new rate
    if (activeMessageId === messageId && !isCancelledRef.current) {
      isRateChangeRef.current = true
      window.speechSynthesis.cancel()
      // The onerror handler will detect isRateChangeRef and call speakCurrentChunk
    }
  }, [messageId])

  /**
   * Pause the current speech.
   */
  const pause = useCallback(() => {
    if (isSupported && activeMessageId === messageId) {
      window.speechSynthesis.pause()
    }
  }, [isSupported, messageId])

  /**
   * Resume paused speech.
   */
  const resume = useCallback(() => {
    if (isSupported && activeMessageId === messageId) {
      window.speechSynthesis.resume()
    }
  }, [isSupported, messageId])

  // Cleanup on unmount: stop speech if this message is active
  useEffect(() => {
    return () => {
      if (activeMessageId === messageId) {
        isCancelledRef.current = true
        isRateChangeRef.current = false
        window.speechSynthesis?.cancel()
        activeMessageId = null
        activeStopFn = null
      }
    }
  }, [messageId])

  return {
    speechState,
    rate,
    activeWordIndex,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    changeRate,
  }
}
