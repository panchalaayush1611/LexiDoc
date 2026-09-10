import { pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// Backend base URL: empty string in production (same origin), configurable for local dev
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Extract text page-by-page from an uploaded PDF File object using pdfjs.
 */
export async function extractPdfText(file) {
  if (!file) return []
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const pages = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const text = textContent.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim()
      if (text) {
        pages.push({ page: i, text })
      }
    }
    return pages
  } catch (err) {
    console.error('Error extracting text from PDF:', err)
    return []
  }
}

/**
 * Query the backend /api/chat endpoint with document context and user question.
 * The backend forwards the request to NVIDIA NIM (API key stays server-side).
 */
export async function queryNvidiaNim(question, documentPages = []) {
  // Prepare chunks for the backend
  const chunks = documentPages.map((p) => ({
    page: p.page,
    content: p.text,
  }))

  // Truncate total content safely if exceeding character limits
  let totalLength = chunks.reduce((sum, c) => sum + (c.content?.length || 0), 0)
  if (totalLength > 60000) {
    let remaining = 60000
    for (const chunk of chunks) {
      if (remaining <= 0) {
        chunk.content = ''
      } else if (chunk.content.length > remaining) {
        chunk.content = chunk.content.substring(0, remaining) + ' [truncated]'
        remaining = 0
      } else {
        remaining -= chunk.content.length
      }
    }
  }

  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, chunks }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Backend API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return { answer: data.answer, sources: data.sources || [] }
}
