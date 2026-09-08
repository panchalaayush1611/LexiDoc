// services/pdfService.js
// Thin wrapper so components don't reach into localStorage directly.

import { generateId } from '../utils/helpers.js'

const HISTORY_KEY = 'pdf-chat-history'
const SETTINGS_KEY = 'pdf-chat-settings'

// In-memory cache for raw PDF file objects during the browser session
const activeFileMap = new Map()

export function cachePdfFile(documentId, file) {
  if (documentId && file) {
    activeFileMap.set(documentId, file)
  }
}

export function getCachedPdfFile(documentId) {
  return activeFileMap.get(documentId) || null
}

export function loadConversations() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveConversations(conversations) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations))
}

export function upsertConversation(conversation) {
  const all = loadConversations()
  const idx = all.findIndex((c) => c.id === conversation.id)
  if (idx >= 0) {
    all[idx] = conversation
  } else {
    all.unshift(conversation)
  }
  saveConversations(all)
  return all
}

export function deleteConversation(id) {
  const all = loadConversations().filter((c) => c.id !== id)
  saveConversations(all)
  return all
}

export function clearAllConversations() {
  saveConversations([])
}

export function newConversationShell(pdfMeta) {
  return {
    id: generateId('conv'),
    pdfName: pdfMeta?.filename || 'Untitled document',
    documentId: pdfMeta?.documentId || null,
    pages: pdfMeta?.pages || 0,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { theme: 'light' }
  } catch {
    return { theme: 'light' }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

