import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an intelligent PDF assistant.
Answer questions using ONLY the provided document context.
If the answer cannot be found in the context, clearly say that the information is not available in the document.
Always provide concise but helpful answers.
When possible, include source page references.`

/**
 * Ask Claude a question, grounded in retrieved document chunks.
 * chunks: [{ content, page }]
 */
export async function answerQuestion(question, chunks) {
  const context = chunks
    .map((c) => `[Page ${c.page ?? '?'}]\n${c.content}`)
    .join('\n\n---\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Document context:\n\n${context}\n\nQuestion: ${question}`,
      },
    ],
  })

  const answer = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  const sources = [...new Set(chunks.map((c) => c.page).filter(Boolean))].map((page) => ({ page }))

  return { answer, sources }
}
