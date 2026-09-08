import { Router } from 'express'
import { documents } from './upload.js'
import { extractText, chunkText } from '../services/pdfService.js'
import { answerQuestionWithNvidia } from '../services/nvidiaService.js'

const router = Router()

router.post('/chat', async (req, res) => {
  const { documentId, question } = req.body
  const doc = documents.get(documentId)

  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' })
  if (!question?.trim()) return res.status(400).json({ success: false, message: 'Question is required.' })

  try {
    const { text } = await extractText(doc.path)
    const chunks = chunkText(text).slice(0, 5).map((c, i) => ({ ...c, page: i + 1 }))

    const { answer, sources } = await answerQuestionWithNvidia(question, chunks)
    res.json({ answer, sources })
  } catch (err) {
    console.error('Backend NVIDIA Chat error:', err)
    res.status(500).json({ message: 'Something went wrong while generating the answer using NVIDIA NIM.' })
  }
})

export default router

