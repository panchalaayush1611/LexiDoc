import { useState } from 'react'
import { FileText, Plus, Upload, Settings, Trash2, X, MessageSquare } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm grid place-items-center px-4 animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-lg">
        <h3 className="font-display text-lg mb-2 text-slate-900 dark:text-white font-bold">Clear all chats?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          This will permanently remove every saved conversation from this browser session. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors focus-ring shadow-sm"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ onUploadClick, onNewChat, className = '', onClose }) {
  const { conversations, loadConversation, clearAllChats, conversationId, setIsSettingsOpen } = useApp()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <aside className={`flex flex-col bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors duration-300 ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">
            <FileText size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-extrabold text-slate-900 dark:text-white">LexiDoc</span>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close sidebar" className="text-slate-400 hover:text-slate-900 dark:hover:text-white focus-ring rounded-lg p-1.5 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-3.5 space-y-2 shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus-ring"
        >
          <Plus size={16} strokeWidth={2.5} /> New Chat
        </button>
        <button
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
        >
          <Upload size={15} /> Upload PDF
        </button>
      </div>

      {/* Recent Chats List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
          <MessageSquare size={12} /> Recent Chats
        </p>
        <div className="space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-400 px-3 py-4 italic">No conversations yet.</p>
          )}
          {conversations.map((c) => {
            const isActive = c.id === conversationId
            return (
              <button
                key={c.id}
                onClick={() => loadConversation(c)}
                className={`w-full flex items-center gap-3 text-left text-xs font-semibold px-3 py-2.5 rounded-xl truncate transition-all duration-200 focus-ring ${
                  isActive
                    ? 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <FileText size={15} className={`shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span className="truncate flex-1">{c.pdfName}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 animate-pulse" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-1 shrink-0">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus-ring"
        >
          <Settings size={15} /> Settings
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          className="w-full flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-ring"
        >
          <Trash2 size={15} /> Clear All Chats
        </button>
      </div>

      {confirmOpen && (
        <ConfirmModal
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            clearAllChats()
            setConfirmOpen(false)
          }}
        />
      )}
    </aside>
  )
}


