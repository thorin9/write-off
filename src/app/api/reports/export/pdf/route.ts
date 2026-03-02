import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Build a simple HTML-based PDF using browser-friendly approach
// Returns an HTML report that can be printed to PDF
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const expenses = await prisma.expense.findMany({
      where: {
        userId: dbUser.id,
        date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) },
      },
      orderBy: [{ category: 'asc' }, { date: 'asc' }],
    })

    // Group by category
    const byCategory: Record<string, typeof expenses> = {}
    for (const exp of expenses) {
      const cat = exp.category || 'Uncategorized'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(exp)
    }

    const totalDeductible = expenses
      .filter((e) => e.deductibility === 'deductible' || e.deductibility === 'likely_deductible')
      .reduce((s, e) => s + e.amount, 0)

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

    const bracketMap: Record<string, number> = {
      '10': 0.1, '12': 0.12, '22': 0.22,
      '24': 0.24, '32': 0.32, '35': 0.35, '37': 0.37,
    }
    const bracketStr = (dbUser.taxBracket || '22').replace(/[^0-9]/g, '')
    const taxRate = bracketMap[bracketStr] || 0.22
    const effectiveRate = taxRate + 0.0765
    const estimatedSavings = totalDeductible * effectiveRate

    const fmt = (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

    const statusBadge = (s: string | null) => {
      if (!s) return '<span style="color:#64748b">Pending</span>'
      const map: Record<string, string> = {
        deductible: '#22c55e',
        likely_deductible: '#f59e0b',
        not_deductible: '#ef4444',
        partial: '#fb923c',
      }
      const label: Record<string, string> = {
        deductible: '✅ Deductible',
        likely_deductible: '🟡 Likely',
        not_deductible: '🔴 Not Deductible',
        partial: '⚠️ Partial',
      }
      return `<span style="color:${map[s] || '#64748b'}">${label[s] || s}</span>`
    }

    const categoryRows = Object.entries(byCategory)
      .map(([cat, exps]) => {
        const catTotal = exps.reduce((s, e) => s + e.amount, 0)
        const catDeductible = exps
          .filter((e) => e.deductibility === 'deductible' || e.deductibility === 'likely_deductible')
          .reduce((s, e) => s + e.amount, 0)
        return `
      <div style="margin-bottom:24px;page-break-inside:avoid">
        <div style="background:#1e293b;padding:10px 16px;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between">
          <strong style="color:#f1f5f9">${cat}</strong>
          <span style="color:#94a3b8">${exps.length} items · ${fmt(catTotal)} total · <span style="color:#22c55e">${fmt(catDeductible)} deductible</span></span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#0f172a">
              <th style="text-align:left;padding:6px 8px;color:#64748b;font-weight:500">Date</th>
              <th style="text-align:left;padding:6px 8px;color:#64748b;font-weight:500">Merchant</th>
              <th style="text-align:right;padding:6px 8px;color:#64748b;font-weight:500">Amount</th>
              <th style="text-align:left;padding:6px 8px;color:#64748b;font-weight:500">Status</th>
            </tr>
          </thead>
          <tbody>
            ${exps
              .map(
                (e, i) => `
              <tr style="background:${i % 2 === 0 ? '#0f172a' : '#1e293b'}">
                <td style="padding:6px 8px;color:#94a3b8">${new Date(e.date).toLocaleDateString('en-US')}</td>
                <td style="padding:6px 8px;color:#f1f5f9">${e.merchant}</td>
                <td style="padding:6px 8px;text-align:right;color:#f1f5f9;font-family:monospace">${fmt(e.amount)}</td>
                <td style="padding:6px 8px">${statusBadge(e.deductibility)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>`
      })
      .join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Write-Off Tax Report ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0f1e; color: #f1f5f9; padding: 32px; }
    @media print {
      body { background: white; color: black; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#1e293b;padding:12px 20px;border-radius:8px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between">
    <span style="color:#94a3b8">This is your tax report. Use your browser's Print (Ctrl+P / Cmd+P) to save as PDF.</span>
    <button onclick="window.print()" style="background:#22c55e;color:#0a0f1e;border:none;padding:8px 20px;border-radius:8px;font-weight:600;cursor:pointer">Save as PDF</button>
  </div>

  <div style="max-width:900px;margin:0 auto">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #1e293b">
      <div>
        <div style="font-size:28px;font-weight:800;color:#22c55e;margin-bottom:4px">Write-Off</div>
        <div style="color:#94a3b8;font-size:14px">AI-Powered Tax Report</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:20px;font-weight:700;color:#f1f5f9">Tax Year ${year}</div>
        <div style="color:#94a3b8;font-size:13px">Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        ${dbUser.name ? `<div style="color:#94a3b8;font-size:13px">${dbUser.name}</div>` : ''}
        ${dbUser.occupation ? `<div style="color:#64748b;font-size:12px">${dbUser.occupation}</div>` : ''}
      </div>
    </div>

    <!-- Summary Cards -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px">
      <div style="background:#1e293b;border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:12px;margin-bottom:4px">Total Expenses</div>
        <div style="font-size:24px;font-weight:700;color:#f1f5f9">${fmt(totalExpenses)}</div>
      </div>
      <div style="background:#064e3b;border-radius:12px;padding:20px">
        <div style="color:#6ee7b7;font-size:12px;margin-bottom:4px">Total Deductible</div>
        <div style="font-size:24px;font-weight:700;color:#22c55e">${fmt(totalDeductible)}</div>
      </div>
      <div style="background:#064e3b;border-radius:12px;padding:20px">
        <div style="color:#6ee7b7;font-size:12px;margin-bottom:4px">Estimated Savings</div>
        <div style="font-size:24px;font-weight:700;color:#22c55e">${fmt(estimatedSavings)}</div>
        <div style="color:#6ee7b7;font-size:11px;margin-top:2px">~${Math.round(effectiveRate * 100)}% effective rate</div>
      </div>
    </div>

    <!-- IRS Note -->
    <div style="background:#1c1917;border:1px solid #44403c;border-radius:8px;padding:12px 16px;margin-bottom:32px;font-size:12px;color:#a8a29e">
      ⚠️ This report is generated by AI and is for informational purposes only. Deductibility assessments are based on IRS Publication 535 guidelines. Always verify with a qualified CPA before filing. Write-Off is not liable for tax filing decisions.
    </div>

    <!-- Schedule C Categories -->
    <h2 style="font-size:18px;font-weight:700;color:#f1f5f9;margin-bottom:16px">Schedule C — Business Expense Breakdown</h2>
    ${categoryRows}
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (err) {
    console.error('PDF export error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
