'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Clock,
  Upload,
  Plus,
  MessageSquare,
  FileDown,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

type Stats = {
  totalExpenses: number
  totalDeductible: number
  estimatedSavings: number
  confirmedDeductions: number
  pendingReview: number
  taxRate: number
}

type ChartEntry = { month: string; deductible: number; nonDeductible: number }

type RecentExpense = {
  id: string
  merchant: string
  amount: number
  deductibility: string | null
  date: string
  source: string
}

const deductibilityBadge: Record<string, string> = {
  deductible: 'text-green-400 bg-green-950 border border-green-800',
  likely_deductible: 'text-amber-400 bg-amber-950 border border-amber-800',
  not_deductible: 'text-red-400 bg-red-950 border border-red-800',
  partial: 'text-orange-400 bg-orange-950 border border-orange-800',
}

const deductibilityLabel: Record<string, string> = {
  deductible: '✅ Deductible',
  likely_deductible: '🟡 Likely',
  not_deductible: '🔴 Not Deductible',
  partial: '⚠️ Partial',
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartEntry[]>([])
  const [recent, setRecent] = useState<RecentExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats)
        setChartData(d.chartData || [])
        setRecent(d.recent || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    )
  }

  const hasData = stats && (stats.totalExpenses > 0 || stats.pendingReview > 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">{new Date().getFullYear()} tax year overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <Upload className="w-4 h-4" /> Upload
          </Link>
          <Link
            href="/dashboard/expenses"
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </Link>
        </div>
      </div>

      {!hasData ? (
        /* Empty state */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-950 border border-green-800 flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Welcome to Write-Off</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Start tracking your expenses to see your estimated tax savings. Upload a bank statement
            or add expenses manually.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-900 font-semibold px-6 py-3 rounded-xl transition"
            >
              <Upload className="w-4 h-4" /> Upload Statement
            </Link>
            <Link
              href="/dashboard/expenses"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> Add Manually
            </Link>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition"
            >
              <MessageSquare className="w-4 h-4" /> Ask AI
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Expenses (YTD)"
              value={formatCurrency(stats.totalExpenses)}
              sub="This calendar year"
              color="bg-slate-800 text-slate-300"
            />
            <StatCard
              icon={TrendingDown}
              label="Estimated Tax Savings"
              value={formatCurrency(stats.estimatedSavings)}
              sub={`At ~${stats.taxRate}% effective rate`}
              color="bg-green-950 text-green-400"
            />
            <StatCard
              icon={CheckCircle2}
              label="Confirmed Deductions"
              value={stats.confirmedDeductions.toString()}
              sub={`${formatCurrency(stats.totalDeductible)} deductible`}
              color="bg-green-950 text-green-400"
            />
            <StatCard
              icon={Clock}
              label="Pending Review"
              value={stats.pendingReview.toString()}
              sub="Need AI analysis"
              color="bg-amber-950 text-amber-400"
            />
          </div>

          {/* Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">Monthly Spending Breakdown</h2>
            <p className="text-slate-400 text-sm mb-6">Deductible vs. non-deductible by month</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 12,
                    color: '#f1f5f9',
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend
                  formatter={(value) =>
                    value === 'deductible' ? 'Deductible' : 'Non-Deductible'
                  }
                  wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                />
                <Bar dataKey="deductible" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nonDeductible" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/dashboard/upload', icon: Upload, label: 'Upload Bank Statement', sub: 'PDF, CSV, or receipt image' },
                  { href: '/dashboard/expenses', icon: Plus, label: 'Add Manual Expense', sub: 'Log a cash or card purchase' },
                  { href: '/dashboard/chat', icon: MessageSquare, label: 'Ask AI a Tax Question', sub: 'IRS-grounded answers' },
                  { href: '/dashboard/reports', icon: FileDown, label: 'Export Tax Report', sub: 'PDF or CSV for your CPA' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{action.label}</p>
                      <p className="text-slate-500 text-xs">{action.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Recent Expenses</h2>
                <Link href="/dashboard/expenses" className="text-green-400 hover:text-green-300 text-xs">
                  View all →
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No expenses yet</p>
              ) : (
                <div className="space-y-3">
                  {recent.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{exp.merchant}</p>
                        <p className="text-slate-500 text-xs">{formatDate(exp.date)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white text-sm font-mono">{formatCurrency(exp.amount)}</p>
                        {exp.deductibility && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${deductibilityBadge[exp.deductibility] || ''}`}
                          >
                            {deductibilityLabel[exp.deductibility] || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
