import { useCallback, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { askQuestion } from '../services/api.js'

export function useChat() {
  const { currentPDF, addMessage, isThinking, setIsThinking } = useApp()
  const [error, setError] = useState(null)

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || isThinking || !currentPDF?.processed) return

      setError(null)
      addMessage({ role: 'user', content: trimmed })
      setIsThinking(true)

      try {
        const res = await askQuestion(trimmed, currentPDF)
        addMessage({ role: 'assistant', content: res.answer, sources: res.sources })
      } catch (err) {
        setError('Something went wrong while generating the answer.')
        addMessage({
          role: 'assistant',
          content: "Something went wrong while generating the answer.",
          isError: true,
        })
      } finally {
        setIsThinking(false)
      }
    },
    [currentPDF, isThinking, addMessage, setIsThinking]
  )

  return { sendMessage, isThinking, error, setError }
}
