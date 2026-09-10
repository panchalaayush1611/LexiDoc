/**
 * Lexical Retrieval & Synthesis Engine for LexiDoc
 * Production-safe in-memory BM25-style lexical scoring and phrase matching.
 * Provides grounded evidence selection and answer synthesis without persistent DBs.
 */

export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves'
])

export function tokenize(text) {
  const cleaned = (text || '')
    .toLowerCase()
    .replace(/['’]s\b/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
  return cleaned.split(/\s+/).filter((w) => w.length > 0 && !STOPWORDS.has(w))
}

/**
 * Retrieve the smallest sufficient set of highly relevant pages/chunks using BM25-style lexical scoring
 * and exact phrase boosting.
 */
export function retrieveRelevantEvidence(question, docPages = []) {
  if (!docPages || docPages.length === 0) return []
  const qTokens = tokenize(question)
  if (qTokens.length === 0) {
    return docPages.slice(0, 1).map((p) => ({ page: p.page, content: p.text || p.content || '', score: 1.0 }))
  }

  const qLower = question.toLowerCase()
  const isSummary = /summar|overview|key point|takeaway|abstract|main concept/i.test(question)
  const isProcedure = /procedure|step|how to|algorithm|method|process|implement|code|tool|dataset/i.test(question)
  const isComparison = /compare|difference|versus|vs\b|pros and cons/i.test(question)

  // Extract key 2-word continuous phrases from query
  const rawWords = qLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const phrases = []
  for (let i = 0; i < rawWords.length - 1; i++) {
    if (!STOPWORDS.has(rawWords[i]) || !STOPWORDS.has(rawWords[i + 1])) {
      phrases.push(`${rawWords[i]} ${rawWords[i + 1]}`)
    }
  }

  const totalPages = docPages.length
  const avgLen = docPages.reduce((acc, p) => acc + ((p.text || p.content)?.length || 0), 0) / (totalPages || 1) || 500

  // Document Frequency (DF) map
  const dfMap = new Map()
  for (const token of qTokens) {
    let df = 0
    for (const p of docPages) {
      if (((p.text || p.content) || '').toLowerCase().includes(token)) df++
    }
    dfMap.set(token, df)
  }

  const scoredPages = docPages.map((p) => {
    const text = p.text || p.content || ''
    const textLower = text.toLowerCase()
    const docLen = text.length

    let score = 0

    // 1. BM25-style Term Frequency + Inverse Document Frequency
    for (const token of qTokens) {
      const regex = new RegExp(`\\b${token}\\b`, 'gi')
      const matches = textLower.match(regex)
      const count = matches ? matches.length : 0
      if (count > 0) {
        const df = dfMap.get(token) || 1
        const idf = Math.log(1 + (totalPages - df + 0.5) / (df + 0.5))
        const tf = count / (count + 1.2 * (0.25 + 0.75 * (docLen / avgLen)))
        score += tf * (idf > 0 ? idf : 0.5) * 4.0
      }
    }

    // 2. Exact phrase bonus (e.g. "practical 3", "multiple linear")
    for (const phrase of phrases) {
      if (textLower.includes(phrase)) {
        score += 8.0
      }
    }

    // 3. Key heading / Section match (matches tokens against the section header prefix)
    const lines = text.split(/[\r\n]+/)
    for (const line of lines) {
      const lineLower = line.trim().toLowerCase()
      const headerMatch = lineLower.match(/^(?:aim|objective|title|goal|tools?|datasets?|theory|concept|procedure|methodology|steps?|conclusion|observations?)\b[^:\n\r]*[:\-–—]/i)
      if (headerMatch) {
        const headerPrefix = headerMatch[0]
        for (const token of qTokens) {
          if (headerPrefix.includes(token)) {
            score += 25.0
          }
        }
      }
      if (/^practical\s*\d+/i.test(lineLower)) {
        for (const token of qTokens) {
          if (lineLower.includes(token)) {
            score += 4.0
          }
        }
      }
    }

    // 4. Procedure continuity bonus: pages with numbered steps when query is about procedure/steps
    if (isProcedure && /(?:^|\s)\d+[\.\)]\s+/i.test(text)) {
      score += 15.0
    }

    // 5. Proximity bonus: multiple query tokens in the same sentence
    const sentences = text.split(/[.!?]+[\s\r\n]+/)
    for (const sent of sentences) {
      const sentLower = sent.toLowerCase()
      const matchedTokensInSent = qTokens.filter((t) => sentLower.includes(t))
      if (matchedTokensInSent.length >= 2) {
        score += 3.0 * matchedTokensInSent.length
      }
    }

    return { page: p.page, content: text, score }
  })

  // For procedure queries: check for consecutive continuation pages
  if (isProcedure) {
    for (let i = 0; i < scoredPages.length; i++) {
      const sp = scoredPages[i]
      if (sp.score >= 15.0 && /procedure|methodology|algorithm/i.test(sp.content)) {
        const nextPage = docPages.find((p) => p.page === sp.page + 1)
        if (nextPage) {
          const nextText = nextPage.text || nextPage.content || ''
          if (/(?:^|\s)\d+[\.\)]\s+/.test(nextText)) {
            const nextScored = scoredPages.find((p) => p.page === nextPage.page)
            if (nextScored) {
              nextScored.score = Math.max(nextScored.score, sp.score * 0.75)
            }
          }
        }
      }
    }
  }

  scoredPages.sort((a, b) => b.score - a.score)
  const maxScore = scoredPages[0]?.score || 0

  if (maxScore <= 1.0) {
    return []
  }

  // Adaptive thresholding:
  // For specific factual questions (aims, facts), if the top page is decisive, return only the top page.
  if (!isSummary && !isProcedure && !isComparison) {
    if (scoredPages.length > 1 && scoredPages[0].score >= 8.0 && scoredPages[1].score < scoredPages[0].score * 0.45) {
      return [scoredPages[0]]
    }
    return scoredPages
      .filter((p) => p.score >= Math.max(2.0, maxScore * 0.5))
      .slice(0, 2)
  }

  // For broader questions (procedures, summaries, comparisons):
  return scoredPages
    .filter((p) => p.score >= Math.max(1.5, maxScore * 0.25))
    .slice(0, 3)
}

/**
 * Intelligent Fallback Synthesizer:
 * Never dumps raw blockquotes. Synthesizes direct concise answers for factual questions,
 * structured detail for procedures/summaries/explanations, and handles not-found clearly.
 */
export function synthesizeDirectAnswer(question, relevantChunks = []) {
  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: "I couldn't find that information in the uploaded document.",
      sources: []
    }
  }

  const qLower = question.toLowerCase()
  const qTokens = tokenize(question)
  const topChunk = relevantChunks[0]
  const topText = topChunk.content || ''
  const lines = topText.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean)

  // 1. Aim / Objective query
  const isAimQuery = /\b(aim|objective|goal|purpose)\b/i.test(qLower)
  if (isAimQuery) {
    for (const chunk of relevantChunks) {
      const text = chunk.content || ''
      const aimMatch = text.match(/\b(?:aim|objective|goal)\b[^:\n\r]*[:\-–—]\s*([^.\n\r]+(?:\.[^.\n\r]+)?)/i)
      if (aimMatch) {
        let aimContent = aimMatch[1].trim()
        let cleanedAim = aimContent.replace(/^to\s+/i, '').replace(/\.+$/, '')
        if (cleanedAim.length > 0) {
          cleanedAim = cleanedAim.charAt(0).toLowerCase() + cleanedAim.slice(1)
        }
        const practicalMatch = text.match(/practical\s*(\d+)/i) || qLower.match(/practical\s*(\d+)/i)
        const practicalLabel = practicalMatch ? `Practical ${practicalMatch[1]}` : 'the practical'
        return {
          answer: `The aim of ${practicalLabel} is to ${cleanedAim}. [Page ${chunk.page}]`,
          sources: [{ page: chunk.page }]
        }
      }
    }
  }

  // 2. Tools / Dataset / Requirements query
  if (/\b(tools?|datasets?|requirements?|technolog(?:y|ies)|software)\b/i.test(qLower)) {
    const matchedLines = []
    for (const line of lines) {
      if (/^(?:tools?|datasets?|requirements?|software)\b[^:\n\r]*[:\-–—]/i.test(line)) {
        matchedLines.push(line)
      }
    }
    if (matchedLines.length > 0) {
      const formatted = matchedLines.map((l) => `- **${l}**`).join('\n')
      return {
        answer: `Based on the document, the following are specified:\n\n${formatted}\n\n[Page ${topChunk.page}]`,
        sources: [{ page: topChunk.page }]
      }
    }
  }

  // 3. Procedure / Step-by-Step query (extracts ALL steps across chunks without truncation)
  const isProcedureQuery = /procedure|step|how to|algorithm|method|process|implement/i.test(qLower)
  if (isProcedureQuery) {
    const allSteps = []
    const contributingPages = new Set()

    for (const chunk of relevantChunks) {
      const text = chunk.content || ''
      const procMatch = text.match(/\b(?:procedure|methodology|steps?|algorithm)\b[^:\n\r]*[:\-–—]?\s*([\s\S]*)/i)
      let searchBody = procMatch ? procMatch[1] : text

      // Cut off at subsequent section header
      const endMatch = searchBody.match(/(?:^|\n|\s+)(?:conclusion|observations?|outcomes?|precautions?|viva\s+voce|theory|aim|overview|results?)\s*[:\-–—]/i)
      if (endMatch) {
        searchBody = searchBody.slice(0, endMatch.index).trim()
      }

      const stepRegex = /(?:^|\s)(\d+)[\.\)]\s+([\s\S]*?)(?=(?:\s+\d+[\.\)]\s+|$))/g
      let m
      let foundInChunk = false
      while ((m = stepRegex.exec(searchBody)) !== null) {
        const num = parseInt(m[1], 10)
        let content = m[2].trim().replace(/\s+/g, ' ').replace(/\.+$/, '')
        if (content.length > 0) {
          allSteps.push({ num, content, page: chunk.page })
          foundInChunk = true
        }
      }
      if (foundInChunk) {
        contributingPages.add(chunk.page)
      }
    }

    if (allSteps.length > 0) {
      const seen = new Set()
      const uniqueSteps = []
      for (const s of allSteps) {
        if (!seen.has(s.num)) {
          seen.add(s.num)
          uniqueSteps.push(s)
        }
      }
      uniqueSteps.sort((a, b) => a.num - b.num)
      const pagesList = [...contributingPages].map((p) => `[Page ${p}]`).join(' ')
      return {
        answer: `### Procedure\n\n${uniqueSteps.map((s) => `${s.num}. ${s.content}.`).join('\n')}\n\n${pagesList}`,
        sources: [...contributingPages].map((page) => ({ page }))
      }
    }

    // Fallback: If no numbered steps found, but a procedure section exists:
    for (const chunk of relevantChunks) {
      const text = chunk.content || ''
      const procMatch = text.match(/\b(?:procedure|methodology|steps?|algorithm)\b[^:\n\r]*[:\-–—]?\s*([\s\S]*)/i)
      if (procMatch) {
        let searchBody = procMatch[1]
        const endMatch = searchBody.match(/(?:^|\n|\s+)(?:conclusion|observations?|outcomes?|precautions?|viva\s+voce|theory|aim|overview|results?)\s*[:\-–—]/i)
        if (endMatch) {
          searchBody = searchBody.slice(0, endMatch.index).trim()
        }
        if (searchBody.length > 15) {
          return {
            answer: `### Procedure\n\n${searchBody}\n\n[Page ${chunk.page}]`,
            sources: [{ page: chunk.page }]
          }
        }
      }
    }
  }

  // 4. Theory / Explanation / Concept query
  const isExplanationQuery = /explain|what is|how does|describe|detail|elaborate|theory|concept/i.test(qLower)
  if (isExplanationQuery) {
    for (const chunk of relevantChunks) {
      const text = chunk.content || ''
      const theoryMatch = text.match(/\b(?:theory|concept|explanation|description|overview|methodology)\b[^:\n\r]*[:\-–—]?\s*([\s\S]*)/i)
      if (theoryMatch) {
        let searchBody = theoryMatch[1]
        const endMatch = searchBody.match(/(?:^|\n|\s+)(?:procedure|steps?|conclusion|observations?|outcomes?|precautions?|viva\s+voce|aim|tools?|datasets?)\s*[:\-–—]/i)
        if (endMatch) {
          searchBody = searchBody.slice(0, endMatch.index).trim()
        }
        if (searchBody.length > 20) {
          return {
            answer: `### Theory & Concept\n\n${searchBody}\n\n[Page ${chunk.page}]`,
            sources: [{ page: chunk.page }]
          }
        }
      }
    }
  }

  // 5. Summary / Overview query
  const isSummaryQuery = /summar|overview|key point|takeaway|main concept/i.test(qLower)
  if (isSummaryQuery) {
    const keyTakeaways = []
    for (const chunk of relevantChunks) {
      const cLines = (chunk.content || '').split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean)
      for (const cl of cLines.slice(0, 3)) {
        if (cl.length > 20 && !cl.startsWith('#') && !cl.startsWith('---')) {
          keyTakeaways.push(`- ${cl} [Page ${chunk.page}]`)
          if (keyTakeaways.length >= 4) break
        }
      }
      if (keyTakeaways.length >= 4) break
    }
    if (keyTakeaways.length > 0) {
      return {
        answer: `### Document Summary\n\n${keyTakeaways.join('\n')}`,
        sources: [...new Set(relevantChunks.map((c) => c.page))].map((page) => ({ page }))
      }
    }
  }

  // 6. Targeted Sentence/Paragraph Extraction:
  const candidateSentences = []
  for (const chunk of relevantChunks) {
    const sents = (chunk.content || '').split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 15)
    for (let idx = 0; idx < sents.length; idx++) {
      const sent = sents[idx]
      const sentLower = sent.toLowerCase()
      let matchCount = 0
      for (const token of qTokens) {
        if (sentLower.includes(token)) matchCount++
      }
      if (matchCount >= 2) {
        // If explanation or comparison query, expand to neighboring sentence for context
        let fullAnswer = sent
        if ((isExplanationQuery || isProcedureQuery) && idx + 1 < sents.length && sents[idx + 1].length > 15) {
          fullAnswer = `${sent} ${sents[idx + 1]}`
        }
        candidateSentences.push({ sent: fullAnswer, page: chunk.page, matchCount })
      }
    }
  }

  if (candidateSentences.length > 0) {
    candidateSentences.sort((a, b) => b.matchCount - a.matchCount)
    const best = candidateSentences[0]
    return {
      answer: `${best.sent} [Page ${best.page}]`,
      sources: [{ page: best.page }]
    }
  }

  return {
    answer: "I couldn't find that information in the uploaded document.",
    sources: []
  }
}
