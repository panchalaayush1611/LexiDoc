/**
 * Strips Markdown syntax from text to produce a clean spoken version.
 * Preserves readable content while removing formatting characters.
 */
export function stripMarkdown(text) {
  if (!text) return ''

  let clean = text

  // Remove fenced code blocks entirely (code is not useful when spoken)
  clean = clean.replace(/```[\s\S]*?```/g, '')

  // Remove inline code backticks but keep content
  clean = clean.replace(/`([^`]+)`/g, '$1')

  // Remove images ![alt](url)
  clean = clean.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // Convert links [text](url) → keep text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove heading markers (## Heading → Heading)
  clean = clean.replace(/^#{1,6}\s+/gm, '')

  // Remove bold/italic markers
  clean = clean.replace(/\*\*\*([^*]+)\*\*\*/g, '$1') // ***bold italic***
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1')     // **bold**
  clean = clean.replace(/\*([^*]+)\*/g, '$1')          // *italic*
  clean = clean.replace(/___([^_]+)___/g, '$1')        // ___bold italic___
  clean = clean.replace(/__([^_]+)__/g, '$1')          // __bold__
  clean = clean.replace(/_([^_]+)_/g, '$1')            // _italic_
  clean = clean.replace(/~~([^~]+)~~/g, '$1')          // ~~strikethrough~~

  // Remove bullet markers (- item, * item, • item)
  clean = clean.replace(/^[\s]*[-*•]\s+/gm, '')

  // Remove numbered list markers (1. item)
  clean = clean.replace(/^[\s]*\d+\.\s+/gm, '')

  // Remove blockquote markers
  clean = clean.replace(/^>\s?/gm, '')

  // Remove horizontal rules
  clean = clean.replace(/^[-*_]{3,}\s*$/gm, '')

  // ── Remove repeated special characters & decorative separators ──
  // Lines made entirely of repeated special chars (===, ---, ~~~, |||, +++, etc.)
  clean = clean.replace(/^[=~|+<>^\/\\:;!@#$%&*(){}\[\]_\-─━═•·.,"'`]+\s*$/gm, '')

  // Runs of 2+ identical special characters inline (e.g. "====", "---", "~~~~")
  clean = clean.replace(/([=~|+<>^\/\\:;!@#$%&*()\[\]_\-─━═•·])\1{1,}/g, '')

  // Markdown table separators like |---|---|
  clean = clean.replace(/\|[\s\-:]+\|/g, '')

  // Standalone pipe characters used in table formatting
  clean = clean.replace(/\|/g, ' ')

  // Any remaining tokens that are ONLY special characters (not letters/digits)
  // e.g. standalone "==", "--", ">>", etc.
  clean = clean.replace(/(?<=\s|^)[^\w\s]+(?=\s|$)/g, '')

  // Collapse multiple spaces into single space
  clean = clean.replace(/ {2,}/g, ' ')

  // Collapse multiple newlines into double newline (natural pause)
  clean = clean.replace(/\n{3,}/g, '\n\n')

  // Trim whitespace
  clean = clean.trim()

  return clean
}

/**
 * Splits long text into chunks at sentence boundaries for sequential TTS playback.
 * Targets chunks of roughly `maxLen` characters, breaking at sentence endings.
 */
export function splitIntoChunks(text, maxLen = 3000) {
  if (!text || text.length <= maxLen) return [text]

  const chunks = []
  let remaining = text

  while (remaining.length > maxLen) {
    // Find the last sentence boundary within maxLen
    const slice = remaining.slice(0, maxLen)
    // Look for sentence-ending punctuation followed by whitespace
    const match = slice.match(/.*[.!?]\s/s)

    let splitAt
    if (match) {
      splitAt = match[0].length
    } else {
      // Fallback: split at last whitespace within maxLen
      const lastSpace = slice.lastIndexOf(' ')
      splitAt = lastSpace > 0 ? lastSpace + 1 : maxLen
    }

    chunks.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }

  if (remaining) {
    chunks.push(remaining)
  }

  return chunks
}
