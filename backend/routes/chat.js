import { Router } from 'express'
import { documents } from './upload.js'
import { extractText, chunkText } from '../services/pdfService.js'
import { answerQuestionWithNvidia } from '../services/nvidiaService.js'

const router = Router()

router.post('/chat', async (req, res) => {
  const { documentId, question, chunks } = req.body

  if (!question?.trim()) return res.status(400).json({ success: false, message: 'Question is required.' })

  try {
    let finalChunks = chunks

    // If chunks were provided directly by the frontend (production/serverless path),
    // use them as-is. Otherwise, fall back to the legacy upload-based flow (local dev).
    if (!finalChunks || finalChunks.length === 0) {
      const doc = documents.get(documentId)
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found. Please provide document text chunks.' })

      const { text } = await extractText(doc.path)
      finalChunks = chunkText(text).slice(0, 5).map((c, i) => ({ ...c, page: i + 1 }))
    }

    const { answer, sources } = await answerQuestionWithNvidia(question, finalChunks)
    res.json({ answer, sources })
  } catch (err) {
    console.error('Backend Chat error:', err)
    res.status(500).json({ message: 'Something went wrong while generating the answer.' })
  }
})

export default router
