import { useCallback, useRef, useState } from 'react'
import { UploadCloud, FileText, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { formatBytes, isPdfFile, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../utils/helpers.js'
import { uploadPdf, processDocument } from '../services/api.js'

export default function UploadArea({ onReady }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState('')
  const [done, setDone] = useState(false)

  const validate = (candidate) => {
    if (!isPdfFile(candidate)) return 'Please upload a valid PDF file.'
    if (candidate.size > MAX_FILE_SIZE_BYTES) return 'This PDF exceeds the maximum allowed file size.'
    return ''
  }

  const handleFiles = useCallback(async (fileList) => {
    const candidate = fileList?.[0]
    if (!candidate) return
    const validationError = validate(candidate)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }
    setError('')
    setFile(candidate)
    try {
      const res = await uploadPdf(candidate)
      setMeta(res)
    } catch {
      setError('Unable to upload the PDF. Please try again.')
    }
  }, [])

  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const remove = () => {
    setFile(null)
    setMeta(null)
    setError('')
    setDone(false)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleProcess = async () => {
    if (!meta) return
    setProcessing(true)
    setError('')
    try {
      await processDocument(meta.documentId, (currentStep, percent) => {
        setStep(currentStep)
        setProgress(percent)
      })
      setDone(true)
      setTimeout(() => {
        onReady({
          id: meta.documentId,
          name: meta.filename,
          pages: meta.pages,
          file,
          processed: true,
        })
      }, 700)
    } catch {
      setError('Something went wrong while processing the PDF.')
    } finally {
      setProcessing(false)
    }
  }

  const PROCESS_STEPS = [
    'Uploading PDF',
    'Extracting Text',
    'Splitting Document',
    'Creating Embeddings',
    'Storing in Vector Index',
  ]

  if (processing || done) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center animate-fadeIn backdrop-blur-md">
        {done ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto mb-4 font-bold">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-display text-xl font-bold mb-1 text-slate-900 dark:text-white">Your PDF is ready!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">You can now ask questions about your document.</p>
          </>
        ) : (
          <>
            <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600 dark:text-indigo-400" size={32} />
            <h3 className="font-display text-xl font-bold mb-1 text-slate-900 dark:text-white">Processing Document…</h3>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-5">{step}</p>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2 p-0.5">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">{progress}%</p>
            <ul className="text-left space-y-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {PROCESS_STEPS.map((s) => {
                const stepIndex = PROCESS_STEPS.indexOf(s)
                const currentIndex = PROCESS_STEPS.indexOf(step)
                const complete = stepIndex <= currentIndex
                return (
                  <li key={s} className={`flex items-center gap-3 ${complete ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold ${complete ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {complete ? '✓' : ''}
                    </span>
                    {s}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    )
  }

  if (file && meta) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 animate-fadeIn backdrop-blur-md">
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shrink-0 font-bold">
            <FileText size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold truncate text-slate-900 dark:text-white">{file.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Size: {formatBytes(file.size)} · Pages: {meta.pages}
            </p>
          </div>
          <button
            onClick={remove}
            aria-label="Remove file"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-ring rounded-lg p-1.5"
          >
            <X size={18} />
          </button>
        </div>
        {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={remove}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
          >
            Remove
          </button>
          <button
            onClick={handleProcess}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all duration-200 hover:scale-[1.01] focus-ring"
          >
            Process PDF
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-fadeIn">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click() }}
        className={`cursor-pointer border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all duration-300 focus-ring ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/15 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 hover:border-indigo-500 dark:hover:border-indigo-400 backdrop-blur-md'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white grid place-items-center mx-auto mb-5 font-bold hover:scale-105 transition-transform">
          <UploadCloud size={30} />
        </div>
        <h3 className="font-display text-2xl font-bold mb-2 text-slate-900 dark:text-white tracking-tight">Upload Your PDF</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 font-medium">Drag & drop your PDF file here, or click to browse</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">Supported: PDF files only · Maximum size: {MAX_FILE_SIZE_MB} MB</p>
        <span className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Sparkles size={14} /> Choose PDF Document
        </span>
      </div>
      {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-4 text-center bg-red-50 dark:bg-red-950/40 p-3 rounded-xl">{error}</p>}
    </div>
  )
}


