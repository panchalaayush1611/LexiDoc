import { pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const API_KEY = import.meta.env.VITE_NVIDIA_NIM_API_KEY || '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'
const MODEL = import.meta.env.VITE_NVIDIA_NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct'
const NIM_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'

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
 * Query NVIDIA NIM API (Llama 3.3 70B Instruct) with document context and user question.
 */
export async function queryNvidiaNim(question, documentPages = []) {
  if (!API_KEY) {
    throw new Error('NVIDIA NIM API key is missing.')
  }

  let contextText = ''
  if (documentPages && documentPages.length > 0) {
    contextText = documentPages
      .map((p) => `[Page ${p.page}]\n${p.text}`)
      .join('\n\n---\n\n')
  }

  // Truncate context safely if exceeding character limits
  if (contextText.length > 60000) {
    contextText = contextText.substring(0, 60000) + '\n\n[Content truncated for length]'
  }

  const systemMessage = `You are an intelligent PDF assistant powered by NVIDIA NIM.
Answer the user's question accurately using the provided PDF document context.
Guidelines:
1. Base your answer on the provided document text whenever possible.
2. Include source page references in your response using format like [Page X] when referencing facts or excerpts.
3. Use clear markdown formatting (bullet points, bold text, headings) when helpful.`

  const userMessageContent = contextText
    ? `Document Context:\n${contextText}\n\nUser Question: ${question}`
    : `User Question: ${question}`

  const PRIMARY_ENDPOINT = '/nvidia-api/v1/chat/completions'
  const FALLBACK_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'

  let response
  try {
    response = await fetch(PRIMARY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessageContent },
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
      }),
    })
  } catch (err) {
    // If proxy fetch fails, try direct endpoint as fallback
    response = await fetch(FALLBACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessageContent },
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
      }),
    })
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`NVIDIA NIM API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content || 'No response was returned by NVIDIA NIM API.'

  // Extract cited page references from response
  const pageMatches = [...answer.matchAll(/\[Page\s*(\d+)\]/gi)]
  const citedPages = [...new Set(pageMatches.map((m) => parseInt(m[1], 10)))]

  let sources = []
  if (citedPages.length > 0) {
    sources = citedPages.sort((a, b) => a - b).map((p) => ({
      page: p,
      content: `Excerpt from Page ${p}`,
    }))
  } else if (documentPages.length > 0) {
    const qWords = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    const scoredPages = documentPages.map((p) => {
      const lower = p.text.toLowerCase()
      let score = 0
      qWords.forEach((w) => {
        if (lower.includes(w)) score += 1
      })
      return { page: p.page, score }
    })
    scoredPages.sort((a, b) => b.score - a.score)
    const top = scoredPages.filter((sp) => sp.score > 0).slice(0, 2)
    sources = top.map((sp) => ({
      page: sp.page,
      content: `Relevant passage on Page ${sp.page}`,
    }))
  }

  return { answer, sources }
}
