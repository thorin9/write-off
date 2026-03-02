'use client'

import { useEffect, useState } from 'react'
import { FileDown, TrendingDown, DollarSign, BarChart3, Loader2, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Summary = {
  totalExpenses: number
  totalDeductible: number
  totalPartialDeductions: number
  estimatedTaxSavings: number
  taxBracket: string
  effectiveRate: number
  expenseCount: number
}

type CategoryRow = {
  category: string
  total: number
  count: number
  deductibleAmount: number
}

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState<Summary | null>(null)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [occupation, setOccupation] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reports/summary?year=${year}`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary)
        setCategories(d.categoryBreakdown || [])
        setOccupation(d.occupation || null)
      })
      .finally(() => setLoading(false))
  }, [year])

  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tax Summary & Export</h1>
          {occupation && <p className="text-slate-400 text-sm mt-0.5">{occupation}</p>}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-400" />
        </div>
      ) : !summary || summary.expenseCount === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No expenses for {year}</p>
          <p className="text-slate-400 text-sm">Upload a bank statement or add expenses to see your tax summary.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses), icon: DollarSign, color: 'bg-slate-800 text-slate-300' },
              { label: 'Total Deductible', value: formatCurrency(summary.totalDeductible), icon: TrendingDown, color: 'bg-green-950 text-green-400' },
              { label: 'Estimated Savings', value: formatCurrency(summary.estimatedTaxSavings), icon: TrendingDown, color: 'bg-green-950 text-green-400' },
              { label: 'Effective Tax Rate', value: `~${summary.effectiveRate}%`, icon: BarChart3, color: 'bg-slate-800 text-slate-300' },
            ].map((card) => (
              <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-slate-400 text-xs mb-1">{card.label}</p>
                <p className="text-white font-bold text-xl">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Tax Bracket Note */}
          <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-4 text-sm">
            <p className="text-green-300">
              💡 Estimated savings calculated at <strong>~{summary.effectiveRate}%</strong> effective
              rate (income tax {summary.taxBracket} + 7.65% SE tax deduction). You could save{' '}
              <strong>{formatCurrency(summary.estimatedTaxSavings)}</strong> by deducting{' '}
              {formatCurrency(summary.totalDeductible)} in eligible expenses.
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-white font-semibold">Schedule C Category Breakdown</h2>
              <p className="text-slate-400 text-xs mt-0.5">IRS Form 1040 Schedule C expense categories</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="text-left text-slate-400 font-medium px-5 py-3">Category</th>
                  <th className="text-center text-slate-400 font-medium px-4 py-3">Items</th>
                  <th className="text-right text-slate-400 font-medium px-4 py-3">Total Spent</th>
                  <th className="text-right text-slate-400 font-medium px-5 py-3">Deductible</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.category} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                    <td className="px-5 py-3 text-white font-medium">{cat.category}</td>
                    <td className="px-4 py-3 text-center text-slate-400">{cat.count}</td>
                    <td className="px-4 py-3 text-right text-slate-300 font-mono">{formatCurrency(cat.total)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={cat.deductibleAmount > 0 ? 'text-green-400 font-mono font-semibold' : 'text-slate-500 font-mono'}>
                        {formatCurrency(cat.deductibleAmount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="border-t-2 border-slate-700 bg-slate-950/50 font-semibold">
                  <td className="px-5 py-3 text-white">Total</td>
                  <td className="px-4 py-3 text-center text-slate-300">{summary.expenseCount}</td>
                  <td className="px-4 py-3 text-right text-white font-mono">{formatCurrency(summary.totalExpenses)}</td>
                  <td className="px-5 py-3 text-right text-green-400 font-mono">{formatCurrency(summary.totalDeductible)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Export Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-1">Export Your Report</h2>
            <p className="text-slate-400 text-sm mb-4">Download your expense data in multiple formats</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`/api/reports/export/pdf?year=${year}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500/10 border border-green-700/50 hover:bg-green-500/20 text-green-300 px-5 py-4 rounded-xl transition group"
              >
                <FileDown className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">PDF Tax Report</p>
                  <p className="text-green-500/80 text-xs">Formatted summary, ready for your CPA</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
              </a>
              <a
                href={`/api/reports/export/csv?year=${year}`}
                className="flex items-center gap-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-5 py-4 rounded-xl transition group"
              >
                <FileDown className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">CSV Export</p>
                  <p className="text-slate-400 text-xs">All {summary.expenseCount} expenses with AI scores</p>
                </div>
                <FileDown className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-500">
            ⚠️ AI-generated deductibility assessments are based on IRS Publication 535. This is not
            professional tax advice. Consult a CPA before filing. Write-Off is not liable for tax
            filing decisions.
          </div>
        </>
      )}
    </div>
  )
}
