import { useNavigate } from 'react-router-dom'
import { FileUp, Cpu, MessageCircleMore, ArrowRight, Sparkles, Zap, ShieldCheck, FileSearch } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const FLOW = [
  { icon: FileUp, label: 'Upload Document', desc: 'Drag & drop any PDF up to 50MB' },
  { icon: Cpu, label: 'Neural Indexing', desc: 'Instant semantic vector embeddings' },
  { icon: MessageCircleMore, label: 'Interactive AI Chat', desc: 'Get page citations & answers' },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Sub-Millisecond Search',
    desc: 'Powered by in-memory similarity vector search for lightning fast query responses.',
  },
  {
    icon: FileSearch,
    title: 'Exact Page Citations',
    desc: 'Never guess where information came from. Every answer references precise page numbers.',
  },
  {
    icon: ShieldCheck,
    title: '100% Local Memory Privacy',
    desc: 'Your files remain secured locally in memory during active chat sessions.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useApp()

  const handleStartChat = () => {
    if (user) {
      navigate('/chat')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="max-w-5xl mx-auto px-5 pt-16 sm:pt-24 pb-20 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-8 animate-fadeIn">
          <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} /> Next-Generation PDF Assistant
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold leading-[1.1] text-slate-900 dark:text-white mb-6 tracking-tight max-w-3xl mx-auto">
          Transform Static PDFs into <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">Interactive AI Conversations</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
          LexiDoc extracts text, creates semantic embeddings, and provides instant answers with exact page citations. Effortless document intelligence in seconds.
        </p>

        {/* Main Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
          <button
            onClick={handleStartChat}
            className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 focus-ring"
          >
            Upload PDF & Chat <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/about')}
            className="px-8 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 focus-ring"
          >
            How It Works
          </button>
        </div>

        {/* Workflow Pipeline */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 mb-20 backdrop-blur-md">
          <h2 className="font-display text-xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400 mb-10">How LexiDoc Operates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {FLOW.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white grid place-items-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon size={28} />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1.5">{label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-left p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all duration-200 backdrop-blur-md">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center mb-4 font-bold">
                <Icon size={20} />
              </div>
              <h4 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
