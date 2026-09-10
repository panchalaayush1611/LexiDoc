const NIM_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'

/**
 * Ask NVIDIA NIM a question grounded in retrieved PDF chunks.
 */
export async function answerQuestionWithNvidia(question, chunks = []) {
  const apiKey = process.env.NVIDIA_NIM_API_KEY
  const model = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct'

  if (!apiKey) {
    const err = new Error('NVIDIA_NIM_API_KEY is missing.')
    err.status = 500
    throw err
  }

  const context = chunks
    .map((c) => `[Page ${c.page ?? '?'}]\n${c.content}`)
    .join('\n\n---\n\n')

  const systemPrompt = `You are LexiDoc's intelligent PDF assistant.
Answer the user's question accurately using ONLY the provided document context.

Guidelines:
1. Grounding: Answer strictly using facts directly mentioned in the document context. If the answer cannot be found in or directly inferred from the context, respond with: "I couldn't find that information in the uploaded document."
2. Answer length & detail:
   - For simple factual questions (such as aims, dates, names, definitions, or specific values), provide a direct, concise answer (typically 1-2 sentences).
   - For explanations, procedures, step-by-step instructions, summaries, or comparisons, provide thorough, appropriate detail with clear markdown formatting (such as bullet points, numbered steps, or sections).
   - When answering procedure, methodology, or step-by-step questions, output ALL sequential steps mentioned in the document context. Do not omit, truncate, or summarize away any numbered steps.
3. Do NOT dump raw excerpts, blockquotes, or entire pages. Always synthesize a natural, helpful response.
4. Citations: Include exact source page tags in the format [Page X] for every fact or claim referenced. Only cite pages that actually contain and support the stated fact.`

  const response = await fetch(NIM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Document Context:\n\n${context}\n\nQuestion: ${question}` },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorDetail = errorText
    try {
      const parsed = JSON.parse(errorText)
      errorDetail = parsed.detail || parsed.message || parsed.title || errorText
    } catch (_) {}
    const err = new Error(`NVIDIA NIM API Error (${response.status}): ${errorDetail}`)
    err.status = response.status
    err.detail = errorDetail
    throw err
  }

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content || 'No response returned.'

  // Dynamic citation extraction: Only cite pages that actually support the answer
  const citedPageNumbers = new Set()
  const pageRegex = /\[Page\s*(\d+)\]/gi
  let match
  while ((match = pageRegex.exec(answer)) !== null) {
    citedPageNumbers.add(parseInt(match[1], 10))
  }

  // Filter against chunks that were actually provided
  const availablePages = new Set(chunks.map((c) => c.page).filter(Boolean))
  let validCitedPages = [...citedPageNumbers].filter((p) => availablePages.has(p))

  // If answer states information was not found, citations must be empty
  const notFoundPattern = /couldn'?t find|not found|not present|not mentioned|cannot be found/i
  if (notFoundPattern.test(answer)) {
    validCitedPages = []
  } else if (validCitedPages.length === 0 && chunks.length > 0) {
    // If the model answered directly but omitted [Page X], cite only the top evidence chunk
    validCitedPages = [chunks[0].page].filter(Boolean)
  }

  const sources = validCitedPages.map((page) => ({ page }))

  return { answer, sources }
}
