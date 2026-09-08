import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Download, FileText, Upload } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PDFPreview() {
  const { currentPDF, selectedPage, setSelectedPage, setCurrentPDF } = useApp()
  const [numPages, setNumPages] = useState(currentPDF?.pages || 0)
  const [pageInput, setPageInput] = useState(selectedPage)
  const [fileUrl, setFileUrl] = useState(null)

  useEffect(() => {
    if (currentPDF?.file) {
      const url = URL.createObjectURL(currentPDF.file)
      setFileUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setFileUrl(null)
  }, [currentPDF?.file])

  useEffect(() => setPageInput(selectedPage), [selectedPage])

  const totalPages = numPages || currentPDF?.pages || 1

  const goTo = (page) => {
    const clamped = Math.min(Math.max(1, page), totalPages)
    setSelectedPage(clamped)
  }

  const handlePageInputSubmit = (e) => {
    e.preventDefault()
    goTo(Number(pageInput) || 1)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* PDF Header Bar */}
      <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white grid place-items-center shrink-0 font-bold">
            <FileText size={16} />
          </span>
          <span className="text-sm font-bold truncate text-slate-900 dark:text-white">{currentPDF?.name || 'document.pdf'}</span>
        </div>
        <a
          href={fileUrl || '#'}
          download={currentPDF?.name}
          aria-label="Download PDF"
          className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring rounded-xl p-2"
        >
          <Download size={18} />
        </a>
      </div>

      {/* PDF Content Viewer Area (Scrollable Fixed Size Window) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-100/70 dark:bg-slate-950/70 flex flex-col items-center justify-start p-5 space-y-4">
        {fileUrl ? (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={
              <div className="flex flex-col items-center justify-center my-auto py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading PDF pages…</p>
              </div>
            }
            error={<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 my-auto py-16">Preview unavailable for this file format.</p>}
          >
            <Page
              pageNumber={selectedPage}
              width={540}
              className="rounded-2xl overflow-hidden max-w-full border border-slate-200 dark:border-slate-800"
            />
          </Document>
        ) : currentPDF?.isLoadingFile ? (
          <div className="flex flex-col items-center justify-center my-auto py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Restoring PDF document…</p>
          </div>
        ) : (
          <div className="my-auto w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center mx-auto mb-4 font-bold">
              <FileText size={28} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate">{currentPDF?.name || 'Document'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-semibold">Total Pages: {totalPages}</p>
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all focus-ring">
              <Upload size={14} /> Attach PDF File
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const candidate = e.target.files?.[0]
                  if (candidate) {
                    setCurrentPDF({
                      ...currentPDF,
                      file: candidate,
                    })
                  }
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* PDF Footer Page Navigation Bar */}
      <div className="h-16 shrink-0 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo(selectedPage - 1)}
            disabled={selectedPage <= 1}
            aria-label="Previous page"
            className="w-9 h-9 grid place-items-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <ChevronLeft size={18} />
          </button>
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-bold">
            Page
            <input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageInputSubmit}
              className="w-11 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1 focus-ring font-extrabold"
              aria-label="Go to page"
            />
            / {totalPages}
          </form>
          <button
            onClick={() => goTo(selectedPage + 1)}
            disabled={selectedPage >= totalPages}
            aria-label="Next page"
            className="w-9 h-9 grid place-items-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}


