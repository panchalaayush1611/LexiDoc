import { FileUp, ScanText, Cpu, Database, Search, MessageSquareText, Sparkles, CheckCircle2 } from 'lucide-react'

const PIPELINE = [
  {
    step: '01',
    icon: FileUp,
    title: 'Document Ingestion',
    desc: 'Extract raw text content, structural layout, and page boundaries directly from uploaded PDF documents.',
    badge: 'Input Phase',
  },
  {
    step: '02',
    icon: ScanText,
    title: 'Text Chunking & Tokenization',
    desc: 'Segment full-length document text into overlapping contextual blocks for optimal retrieval resolution.',
    badge: 'Preprocessing',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'Semantic Vector Embedding',
    desc: 'Transform text chunks into high-dimensional vector embeddings capturing deep semantic meanings.',
    badge: 'Neural Encoding',
  },
  {
    step: '04',
    icon: Database,
    title: 'Vector Indexing & Storage',
    desc: 'Index vector embeddings into an in-memory database to allow sub-millisecond similarity queries.',
    badge: 'Fast Indexing',
  },
  {
    step: '05',
    icon: Search,
    title: 'Contextual Relevance Match',
    desc: 'Compare user questions against indexed vectors using cosine similarity to pinpoint key excerpt pages.',
    badge: 'Query Retrieval',
  },
  {
    step: '06',
    icon: MessageSquareText,
    title: 'Synthesized Answer & Citations',
    desc: 'Generate concise responses along with exact page number citations so users can instantly verify source context.',
    badge: 'Output Phase',
  },
]

export default function About() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-5 py-12 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4">
          <Sparkles size={14} /> Architecture & Pipeline Flow
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          How LexiDoc Operates
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl mx-auto leading-relaxed font-medium">
          LexiDoc turns static PDF files into intelligent, interactive knowledge bases. Here is a visual step-by-step breakdown of how documents are ingested, indexed, and queried in real time.
        </p>
      </div>

      {/* Visual Pipeline Flowchart */}
      <div className="relative mb-20">
        {/* Connector Line behind cards */}
        <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-300 dark:via-indigo-900 to-indigo-500 -translate-x-1/2" />

        <div className="space-y-6 lg:space-y-10">
          {PIPELINE.map((item, index) => {
            const Icon = item.icon
            const isEven = index % 2 === 0
            return (
              <div key={item.step} className="relative flex flex-col lg:flex-row items-center">
                {/* Card Container */}
                <div className={`w-full lg:w-[46%] ${isEven ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                  <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 hover:border-indigo-500/50 transition-all duration-300 group backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {item.badge}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-400 dark:text-slate-500">
                        STEP {item.step}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Node Indicator */}
                <div className="my-3 lg:my-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 grid place-items-center z-10">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800 pt-12">
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center backdrop-blur-md">
          <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Exact Page Citations</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Every answer includes direct page numbers so you can jump right to the source in the PDF window.</p>
        </div>
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center backdrop-blur-md">
          <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">100% Local Privacy</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Your documents stay secured locally in memory during your active browser chat session.</p>
        </div>
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center backdrop-blur-md">
          <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Multi-Document Sessions</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Switch seamlessly between recent PDF files without re-extracting text or re-processing pages.</p>
        </div>
      </div>
    </div>
  )
}


