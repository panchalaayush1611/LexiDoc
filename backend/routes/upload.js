import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { extractText } from '../services/pdfService.js'

const router = Router()
const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Please upload a valid PDF file.'))
    }
    cb(null, true)
  },
})

// In-memory store for demo purposes — swap for a real database.
export const documents = new Map()

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' })

    const { pages } = await extractText(req.file.path)
    const documentId = crypto.randomUUID()

    documents.set(documentId, {
      filename: req.file.originalname,
      path: req.file.path,
      pages,
      processed: false,
    })

    res.json({ success: true, documentId, filename: req.file.originalname, pages })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to upload the PDF. Please try again.' })
  }
})

router.post('/process', async (req, res) => {
  const { documentId } = req.body
  const doc = documents.get(documentId)
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' })

  // Real implementation: extract -> chunk -> embed -> store in ChromaDB.
  // See services/pdfService.js and services/vectorService.js.
  doc.processed = true
  res.json({ success: true, status: 'completed' })
})

export default router
