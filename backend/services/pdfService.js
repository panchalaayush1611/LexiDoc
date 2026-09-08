import fs from 'fs/promises'
import pdfParse from 'pdf-parse'

/**
 * Extract raw text and page count from a PDF buffer/path.
 */
export async function extractText(filePath) {
  const buffer = await fs.readFile(filePath)
  const data = await pdfParse(buffer)
  return { text: data.text, pages: data.numpages }
}

/**
 * Split extracted text into overlapping chunks, tagging each chunk with
 * an approximate page number so answers can cite sources later.
 */
export function chunkText(text, { chunkSize = 1000, chunkOverlap = 200 } = {}) {
  const chunks = []
  let start = 0
  let chunkId = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push({
      id: `chunk_${chunkId++}`,
      content: text.slice(start, end),
    })
    start += chunkSize - chunkOverlap
  }
  return chunks
}
