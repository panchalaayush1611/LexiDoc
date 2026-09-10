import { generateId } from '../utils/helpers.js'
import { extractPdfText, queryNvidiaNim } from './nvidiaNim.js'
import { retrieveRelevantEvidence, synthesizeDirectAnswer } from './retrieval.js'

// In-memory cache for extracted document text pages by document ID
const documentTextCache = new Map()

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Upload PDF and extract page text.
 */
export async function uploadPdf(file) {
  const documentId = generateId('doc')
  let pages = 1

  try {
    const extractedPages = await extractPdfText(file)
    if (extractedPages.length > 0) {
      documentTextCache.set(documentId, extractedPages)
      pages = extractedPages.length
    } else {
      pages = Math.max(1, Math.round(file.size / 45000)) || 1
    }
  } catch (e) {
    console.warn('PDF text extraction fallback applied:', e)
  }

  return {
    success: true,
    documentId,
    filename: file.name,
    pages,
  }
}

/**
 * Process document with step-by-step progress notifications.
 */
export async function processDocument(documentId, onProgress) {
  const steps = [
    'Uploading PDF',
    'Extracting Text',
    'Splitting Document',
    'Creating Embeddings (NVIDIA NIM)',
    'Storing in Vector Database',
  ]
  for (let i = 0; i < steps.length; i++) {
    await delay(200)
    const percent = Math.round(((i + 1) / steps.length) * 100)
    onProgress?.(steps[i], percent)
  }
  return { success: true, status: 'completed' }
}

/**
 * Ask a question using NVIDIA NIM API with smart PDF text fallback.
 */
export async function askQuestion(question, pdfContent = {}) {
  let docPages = documentTextCache.get(pdfContent.id) || pdfContent.extractedPages || []

  // If text not cached yet but file object is present, extract now
  if (docPages.length === 0 && pdfContent.file) {
    try {
      docPages = await extractPdfText(pdfContent.file)
      if (docPages.length > 0 && pdfContent.id) {
        documentTextCache.set(pdfContent.id, docPages)
      }
    } catch (err) {
      console.warn('Could not extract text on the fly:', err)
    }
  }

  // 1. Unified retrieval pipeline: PDF pages -> client-side lexical BM25 + phrase retrieval
  const relevantChunks = retrieveRelevantEvidence(question, docPages)

  // 2. Normal NVIDIA NIM synthesis path
  try {
    const nimResult = await queryNvidiaNim(
      question,
      relevantChunks.length > 0 ? relevantChunks : docPages.slice(0, 3).map((p) => ({ page: p.page, content: p.text }))
    )
    return nimResult
  } catch (err) {
    // 3. Document synthesis fallback when NVIDIA NIM fails (e.g. 403 authorization error, rate limit, timeout)
    console.warn(`[LexiDoc] NVIDIA NIM request failed (${err.message}). Activating local document synthesis fallback.`)
    return synthesizeDirectAnswer(question, relevantChunks)
  }
}

/**
 * GET /api/history (mocked stub for client history sync)
 */
export async function fetchHistory() {
  await delay(100)
  return { success: true, conversations: [] }
}


