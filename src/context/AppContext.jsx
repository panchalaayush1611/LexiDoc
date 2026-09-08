import { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import {
  loadConversations,
  upsertConversation,
  deleteConversation as deleteConversationFromStore,
  clearAllConversations,
  cachePdfFile,
  getCachedPdfFile,
  getCachedPdfFileAsync,
} from '../services/pdfService.js'
import { generateId } from '../utils/helpers.js'

const AppContext = createContext(null)

function computeAvatar(name, email) {
  const cleanName = (name || '').trim()
  if (cleanName) {
    return cleanName[0].toUpperCase()
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return 'U'
}


export function AppProvider({ children }) {
  const [currentPDFState, setCurrentPDFState] = useState(null) // { id, name, file, pages, processed }

  const setCurrentPDF = useCallback((pdfData) => {
    if (pdfData && pdfData.id && pdfData.file) {
      cachePdfFile(pdfData.id, pdfData.file)
    }
    setCurrentPDFState(pdfData)
  }, [])

  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [conversations, setConversations] = useState(() => {
    const raw = loadConversations()
    return raw.filter((c) => c.messages && c.messages.length > 0)
  })
  const [selectedPage, setSelectedPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Auth state
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lexidoc_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          avatar: computeAvatar(parsed.name, parsed.email),
        }
      }
      return null
    } catch {
      return null
    }
  })

  const login = useCallback((email, password) => {
    const name = email ? email.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase()) : 'Aayush Panchal'
    const userEmail = email || 'aayush@lexidoc.com'
    const fakeUser = {
      name,
      email: userEmail,
      avatar: computeAvatar(name, userEmail),
      role: 'Pro Member',
      joinedDate: 'September 2026',
    }
    localStorage.setItem('lexidoc_user', JSON.stringify(fakeUser))
    setUser(fakeUser)
    return fakeUser
  }, [])

  const signup = useCallback((name, email, password) => {
    const userName = name || 'Aayush Panchal'
    const userEmail = email || 'aayush@lexidoc.com'
    const fakeUser = {
      name: userName,
      email: userEmail,
      avatar: computeAvatar(userName, userEmail),
      role: 'Pro Member',
      joinedDate: 'September 2026',
    }
    localStorage.setItem('lexidoc_user', JSON.stringify(fakeUser))
    setUser(fakeUser)
    return fakeUser
  }, [])

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const name = updatedFields.name !== undefined ? updatedFields.name : prev?.name
      const email = updatedFields.email !== undefined ? updatedFields.email : prev?.email
      const avatar = computeAvatar(name, email)
      const updated = {
        ...prev,
        ...updatedFields,
        name,
        email,
        avatar,
      }
      localStorage.setItem('lexidoc_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('lexidoc_user')
    setUser(null)
  }, [])

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pdf-chatbot-theme') || 'dark'
  })

  // Synchronize dark class on <html> whenever theme state changes
  // useLayoutEffect ensures DOM update happens before browser paint
  useLayoutEffect(() => {
    localStorage.setItem('pdf-chatbot-theme', theme)
    const root = document.documentElement
    const body = document.body
    if (theme === 'dark') {
      root.classList.add('dark')
      if (body) body.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      if (body) body.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  // Persist current conversation ONLY whenever messages change and are non-empty
  useEffect(() => {
    if (!conversationId || !currentPDFState || !messages || messages.length === 0) return
    const conversation = {
      id: conversationId,
      pdfName: currentPDFState.name,
      documentId: currentPDFState.id,
      pages: currentPDFState.pages,
      messages,
      createdAt: conversations.find((c) => c.id === conversationId)?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }
    const updated = upsertConversation(conversation)
    setConversations(updated.filter((c) => c.messages && c.messages.length > 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  const startNewConversation = useCallback((pdfMeta) => {
    const targetPDF = pdfMeta || currentPDFState
    setConversationId(generateId('conv'))
    setMessages([])
    setSelectedPage(1)
    if (targetPDF) {
      setCurrentPDFState(targetPDF)
    }
  }, [currentPDFState])

  const clearChat = useCallback(() => {
    setMessages([])
    if (conversationId) {
      const updated = deleteConversationFromStore(conversationId)
      setConversations(updated.filter((c) => c.messages && c.messages.length > 0))
    }
    setConversationId(generateId('conv'))
  }, [conversationId])

  const resetAll = useCallback(() => {
    setCurrentPDFState(null)
    setMessages([])
    setConversationId(null)
    setSelectedPage(1)
    setIsProcessing(false)
    setIsThinking(false)
  }, [])

  const loadConversation = useCallback(async (conv) => {
    if (!conv) return
    const cachedFile = getCachedPdfFile(conv.documentId)
    setConversationId(conv.id)
    setMessages(conv.messages || [])
    setSelectedPage(1)

    if (cachedFile) {
      setCurrentPDFState({
        id: conv.documentId,
        name: conv.pdfName,
        pages: conv.pages,
        processed: true,
        file: cachedFile,
        isLoadingFile: false,
      })
    } else {
      setCurrentPDFState({
        id: conv.documentId,
        name: conv.pdfName,
        pages: conv.pages,
        processed: true,
        file: null,
        isLoadingFile: true,
      })
      const storedFile = await getCachedPdfFileAsync(conv.documentId)
      setCurrentPDFState((prev) => {
        if (prev?.id === conv.documentId) {
          return {
            ...prev,
            file: storedFile || null,
            isLoadingFile: false,
          }
        }
        return prev
      })
    }
  }, [])

  const removeConversation = useCallback((id) => {
    const updated = deleteConversationFromStore(id)
    setConversations(updated.filter((c) => c.messages && c.messages.length > 0))
  }, [])

  const clearAllChats = useCallback(() => {
    clearAllConversations()
    setConversations([])
  }, [])

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, { id: generateId('msg'), timestamp: Date.now(), ...message }])
  }, [])

  const value = {
    currentPDF: currentPDFState,
    setCurrentPDF,
    messages,
    setMessages,
    addMessage,
    conversationId,
    setConversationId,
    conversations,
    setConversations,
    selectedPage,
    setSelectedPage,
    isProcessing,
    setIsProcessing,
    isThinking,
    setIsThinking,
    theme,
    setTheme,
    toggleTheme,
    startNewConversation,
    clearChat,
    resetAll,
    loadConversation,
    removeConversation,
    clearAllChats,
    isSettingsOpen,
    setIsSettingsOpen,
    user,
    login,
    signup,
    updateUser,
    logout,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}



