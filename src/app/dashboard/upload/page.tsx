'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

type ParsedExpense = {
  date: string
  merchant: string
  amount: number
  description?: string
}

type UploadResult = {
  fileId: string
  fileName: string
  expenses: ParsedExpense[]
  error?: string
}

export default function UploadPage() {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setStatus('uploading')
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload/parse', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setResult(data)
      setStatus('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Statement or Receipt</h1>
        <p className="text-slate-400 mt-1">Supports PDF bank statements, CSV exports, and receipt images</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-green-400 bg-green-950/20'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-white font-medium text-lg">
          {isDragActive ? 'Drop it here...' : 'Drag & drop your file here'}
        </p>
        <p className="text-slate-400 mt-2">or click to browse</p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="flex items-center gap-1 text-slate-500 text-sm">
            <FileText className="w-4 h-4" /> PDF
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-sm">
            <FileText className="w-4 h-4" /> CSV
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-sm">
            <ImageIcon className="w-4 h-4" aria-hidden="true" /> Images
          </span>
        </div>
      </div>

      {/* Status */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="mt-6 flex items-center gap-3 text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-green-400" />
          <span>{status === 'uploading' ? 'Uploading...' : 'Parsing expenses...'}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 flex items-center gap-3 text-red-400 bg-red-950/30 border border-red-900 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status === 'done' && result && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              Parsed {result.expenses.length} transactions from {result.fileName}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Date</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Merchant</th>
                  <th className="text-right text-slate-400 font-medium px-4 py-3">Amount</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {result.expenses.slice(0, 20).map((exp, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">{exp.date}</td>
                    <td className="px-4 py-3 text-white font-medium">{exp.merchant}</td>
                    <td className="px-4 py-3 text-right text-white">${Math.abs(exp.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-400">{exp.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.expenses.length > 20 && (
            <p className="text-slate-400 text-sm mt-2">...and {result.expenses.length - 20} more</p>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href={`/dashboard/expenses?fileId=${result.fileId}`}
              className="bg-green-500 hover:bg-green-400 text-slate-900 font-semibold px-6 py-3 rounded-lg transition"
            >
              Analyze with AI →
            </Link>
            <button
              onClick={() => {
                setStatus('idle')
                setResult(null)
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
