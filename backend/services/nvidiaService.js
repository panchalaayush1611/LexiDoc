const API_KEY = process.env.NVIDIA_NIM_API_KEY
const MODEL = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct'
const NIM_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'

/**
 * Ask NVIDIA NIM (Llama 3.3 70B Instruct) a question grounded in retrieved PDF chunks.
 */
export async function answerQuestionWithNvidia(question, chunks = []) {
  if (!API_KEY) {
    throw new Error('NVIDIA_NIM_API_KEY is missing.')
  }

  const context = chunks
    .map((c) => `[Page ${c.page ?? '?'}]\n${c.content}`)
    .join('\n\n---\n\n')

  const systemPrompt = `You are an intelligent PDF assistant powered by NVIDIA NIM.
Answer questions using ONLY the provided document context.
If the answer cannot be found in the context, clearly state that the information is not present in the document.
Always provide concise, helpful, and formatted markdown answers.
Include source page references like [Page X] whenever referencing facts from the document.`

  const response = await fetch(NIM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
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
    throw new Error(`NVIDIA NIM API Error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content || 'No response returned.'
  const sources = [...new Set(chunks.map((c) => c.page).filter(Boolean))].map((page) => ({ page }))

  return { answer, sources }
}
