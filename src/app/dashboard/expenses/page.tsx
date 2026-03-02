'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, RefreshCw, CheckSquare, Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

type Expense = {
  id: string
  date: string
  merchant: string
  amount: number
  category: string | null
  deductibility: string | null
  confidence: number | null
  aiExplanation: string | null
  irsReference: string | null
  notes: string | null
  reviewed: boolean
  source: string
}

function DeductibilityBadge({ status }: { status: string | null }) {
  if (!status)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-500">
        ⏳ Pending
      </span>
    )

  const map: Record<string, { style: string; label: string }> = {
    deductible: { style: 'bg-green-950 text-green-400 border border-green-800', label: '✅ Deductible' },
    likely_deductible: { style: 'bg-amber-950 text-amber-400 border border-amber-800', label: '🟡 Likely' },
    not_deductible: { style: 'bg-red-950 text-red-400 border border-red-800', label: '🔴 Not Deductible' },
    partial: { style: 'bg-orange-950 text-orange-400 border border-orange-800', label: '⚠️ Partial' },
  }

  const item = map[status]
  if (!item) return null

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.style}`}>
      {item.label}
    </span>
  )
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterDeductibility, setFilterDeductibility] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    amount: '',
    notes: '',
  })

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString() })
      if (search) params.set('search', search)
      if (filterDeductibility) params.set('deductibility', filterDeductibility)
      const res = await fetch(`/api/expenses?${params}`)
      const data = await res.json()
      setExpenses(data.expenses || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterDeductibility])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  async function analyzeOne(id: string) {
    setAnalyzing(id)
    try {
      await fetch('/api/expenses/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseId: id }),
      })
      await fetchExpenses()
    } finally {
      setAnalyzing(null)
    }
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    setTotal((t) => t - 1)
  }

  async function toggleReviewed(id: string, current: boolean) {
    await fetch('/api/expenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reviewed: !current }),
    })
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, reviewed: !current } : e)))
  }

  async function addExpense() {
    if (!newExpense.merchant || !newExpense.amount || !newExpense.date) return
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense),
    })
    if (res.ok) {
      setShowAddForm(false)
      setNewExpense({ date: new Date().toISOString().split('T')[0], merchant: '', amount: '', notes: '' })
      await fetchExpenses()
    }
  }

  const deductibleTotal = expenses
    .filter((e) => e.deductibility === 'deductible' || e.deductibility === 'likely_deductible')
    .reduce((s, e) => s + e.amount, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total} total · {formatCurrency(deductibleTotal)} likely deductible
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/upload"
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Upload
          </Link>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4 text-sm">Add Manual Expense</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Date', type: 'date', key: 'date' },
              { label: 'Merchant', type: 'text', key: 'merchant', placeholder: 'e.g. Amazon' },
              { label: 'Amount ($)', type: 'number', key: 'amount', placeholder: '0.00' },
              { label: 'Notes', type: 'text', key: 'notes', placeholder: 'Optional' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={newExpense[f.key as keyof typeof newExpense]}
                  onChange={(e) => setNewExpense((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addExpense}
              className="bg-green-500 hover:bg-green-400 text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchants…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-52"
          />
        </div>
        <select
          value={filterDeductibility}
          onChange={(e) => { setFilterDeductibility(e.target.value); setPage(1) }}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="deductible">✅ Deductible</option>
          <option value="likely_deductible">🟡 Likely</option>
          <option value="partial">⚠️ Partial</option>
          <option value="not_deductible">🔴 Not Deductible</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-400" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">No expenses yet.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard/upload" className="text-green-400 hover:text-green-300 text-sm">
                Upload statement →
              </Link>
              <button onClick={() => setShowAddForm(true)} className="text-green-400 hover:text-green-300 text-sm">
                Add manually →
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Date</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Merchant</th>
                  <th className="text-right text-slate-400 font-medium px-4 py-3">Amount</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Status</th>
                  <th className="text-center text-slate-400 font-medium px-4 py-3 hidden sm:table-cell">Conf.</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <>
                    <tr
                      key={expense.id}
                      className={`border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer ${expense.reviewed ? 'opacity-60' : ''}`}
                      onClick={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
                    >
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDate(expense.date)}</td>
                      <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">{expense.merchant}</td>
                      <td className="px-4 py-3 text-right text-white font-mono whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell max-w-[140px] truncate">
                        {expense.category || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <DeductibilityBadge status={expense.deductibility} />
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-xs hidden sm:table-cell">
                        {expense.confidence != null ? `${Math.round(expense.confidence)}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!expense.deductibility && (
                            <button
                              onClick={() => analyzeOne(expense.id)}
                              disabled={analyzing === expense.id}
                              title="Analyze with AI"
                              className="text-green-400 hover:text-green-300 p-1.5 rounded-lg hover:bg-slate-800"
                            >
                              {analyzing === expense.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => toggleReviewed(expense.id, expense.reviewed)}
                            title={expense.reviewed ? 'Mark unreviewed' : 'Mark reviewed'}
                            className={`p-1.5 rounded-lg hover:bg-slate-800 ${expense.reviewed ? 'text-green-400' : 'text-slate-600'}`}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            title="Delete"
                            className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {expandedId === expense.id ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === expense.id && (
                      <tr key={`${expense.id}-detail`} className="bg-slate-800/20 border-b border-slate-800/50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="text-sm space-y-1">
                            {expense.aiExplanation ? (
                              <>
                                <p className="text-slate-200">{expense.aiExplanation}</p>
                                {expense.irsReference && (
                                  <p className="text-slate-500 text-xs">📚 {expense.irsReference}</p>
                                )}
                              </>
                            ) : (
                              <p className="text-slate-500 italic">
                                No AI analysis yet.{' '}
                                <button
                                  onClick={() => analyzeOne(expense.id)}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  Analyze now →
                                </button>
                              </p>
                            )}
                            {expense.notes && (
                              <p className="text-slate-400 text-xs">Notes: {expense.notes}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 50 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-slate-400 text-sm">
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <button
            disabled={expenses.length < 50}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
