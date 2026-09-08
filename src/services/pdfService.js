// services/pdfService.js
// Thin wrapper so components don't reach into localStorage directly.

import { generateId } from '../utils/helpers.js'

const HISTORY_KEY = 'pdf-chat-history'
const SETTINGS_KEY = 'pdf-chat-settings'

// In-memory cache for raw PDF file objects during the browser session
const activeFileMap = new Map()

const DB_NAME = 'LexiDocPDFStore'
const DB_VERSION = 1
const STORE_NAME = 'pdf_files'

function openPDFDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null)
      return
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = (e) => resolve(e.target.result)
    request.onerror = () => resolve(null)
  })
}

export async function savePdfBlobToDB(documentId, fileOrBlob) {
  if (!documentId || !fileOrBlob) return
  try {
    const arrayBuffer = await fileOrBlob.arrayBuffer()
    const type = fileOrBlob.type || 'application/pdf'
    const name = fileOrBlob.name || 'document.pdf'
    const record = {
      buffer: arrayBuffer,
      type,
      name,
      updatedAt: Date.now(),
    }
    const db = await openPDFDB()
    if (!db) return
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(record, documentId)
    await new Promise((resolve) => {
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
  } catch (err) {
    console.error('Failed to save PDF blob to IndexedDB:', err)
  }
}

export async function getPdfBlobFromDB(documentId) {
  if (!documentId) return null
  try {
    const db = await openPDFDB()
    if (!db) return null
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(documentId)
    const result = await new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
    if (!result) return null
    if (result instanceof Blob) {
      return result
    }
    if (result.buffer) {
      return new File([result.buffer], result.name || 'document.pdf', { type: result.type || 'application/pdf' })
    }
    return null
  } catch (err) {
    console.error('Failed to get PDF blob from IndexedDB:', err)
    return null
  }
}

export async function deletePdfBlobFromDB(documentId) {
  if (!documentId) return
  try {
    const db = await openPDFDB()
    if (!db) return
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(documentId)
  } catch (err) {
    console.error('Failed to delete PDF blob from IndexedDB:', err)
  }
}

export function cachePdfFile(documentId, file) {
  if (documentId && file) {
    activeFileMap.set(documentId, file)
    savePdfBlobToDB(documentId, file)
  }
}

export function getCachedPdfFile(documentId) {
  return activeFileMap.get(documentId) || null
}

export async function getCachedPdfFileAsync(documentId) {
  if (!documentId) return null
  if (activeFileMap.has(documentId)) {
    return activeFileMap.get(documentId)
  }
  const blob = await getPdfBlobFromDB(documentId)
  if (blob) {
    activeFileMap.set(documentId, blob)
  }
  return blob
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

