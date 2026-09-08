import { useMemo, useState } from 'react'
import { Search, FileText, Trash2, FolderOpen, Clock, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/helpers.js'

export default function History() {
  const { conversations, removeConversation, loadConversation } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    let list = conversations.filter((c) =>
      c.pdfName.toLowerCase().includes(query.toLowerCase())
    )
    if (sort === 'newest') list = [...list].sort((a, b) => b.updatedAt - a.updatedAt)
    if (sort === 'oldest') list = [...list].sort((a, b) => a.updatedAt - b.updatedAt)
    if (sort === 'alphabetical') list = [...list].sort((a, b) => a.pdfName.localeCompare(b.pdfName))
    return list
  }, [conversations, query, sort])

  const openConversation = (c) => {
    loadConversation(c)
    navigate('/chat')
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-12 overflow-y-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-2 text-slate-900 dark:text-white tracking-tight">Chat History</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Every conversation you've had in LexiDoc, saved locally in your browser.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 flex items-center gap-2.5 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 backdrop-blur-md focus-within:border-indigo-500 transition-colors">
          <Search size={17} className="text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved conversations..."
            className="flex-1 bg-transparent text-xs sm:text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm focus-ring font-semibold cursor-pointer backdrop-blur-md w-full sm:w-auto"
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
          <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-400" />
        </div>
      </div>


      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
          {conversations.length === 0 ? 'No saved conversations yet — start a chat to view your history.' : 'No conversations match your search criteria.'}
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filtered.map((c) => {
            const lastMsg = [...(c.messages || [])].reverse().find((m) => m.role === 'user')
            return (
              <div
                key={c.id}
                className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-4 hover:border-indigo-500/50 transition-all duration-200 backdrop-blur-md group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate text-slate-900 dark:text-white mb-0.5">{c.pdfName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                    {lastMsg ? `"${lastMsg.content}"` : 'No questions asked yet'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={11} /> {timeAgo(c.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openConversation(c)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 focus-ring"
                  >
                    <FolderOpen size={14} /> Open
                  </button>
                  <button
                    onClick={() => removeConversation(c.id)}
                    aria-label={`Delete conversation ${c.pdfName}`}
                    className="w-9 h-9 grid place-items-center rounded-full text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors focus-ring"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


