import { useState } from 'react'
import { Menu, FileText, MessageSquare } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import UploadArea from '../components/UploadArea.jsx'
import PDFPreview from '../components/PDFPreview.jsx'
import ChatWindow from '../components/ChatWindow.jsx'

export default function Chat() {
  const { currentPDF, setCurrentPDF, startNewConversation, resetAll } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState('chat')

  const handleReady = (pdfMeta) => {
    setCurrentPDF(pdfMeta)
    startNewConversation(pdfMeta)
  }

  if (!currentPDF?.processed) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-16 overflow-y-auto">
        <UploadArea onReady={handleReady} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden relative">
      {/* Desktop sidebar */}
      <Sidebar
        className="hidden lg:flex w-64 shrink-0"
        onUploadClick={resetAll}
        onNewChat={() => startNewConversation(currentPDF)}
      />

      {/* Mobile/tablet sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <Sidebar
            className="absolute left-0 top-0 bottom-0 w-72 animate-slideUp z-50 shadow-xl"
            onUploadClick={() => { resetAll(); setSidebarOpen(false) }}
            onNewChat={() => { startNewConversation(currentPDF); setSidebarOpen(false) }}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="w-9 h-9 grid place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 focus-ring text-slate-800 dark:text-white"
          >
            <Menu size={18} />
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMobileTab('pdf')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full transition-colors focus-ring font-bold ${
                mobileTab === 'pdf' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <FileText size={13} /> PDF
            </button>
            <button
              onClick={() => setMobileTab('chat')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full transition-colors focus-ring font-bold ${
                mobileTab === 'chat' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <MessageSquare size={13} /> Chat
            </button>
          </div>
          <span className="w-9" />
        </div>

        {/* Main Content Split Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className={`${mobileTab === 'pdf' ? 'flex' : 'hidden'} md:flex flex-col flex-1 md:w-1/2 min-h-0 overflow-hidden border-r border-slate-200 dark:border-slate-800`}>
            <PDFPreview />
          </div>
          <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-col flex-1 md:w-1/2 min-h-0 overflow-hidden`}>
            <ChatWindow onOpenUpload={resetAll} />
          </div>
        </div>
      </div>
    </div>
  )
}
