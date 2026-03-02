import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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

    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31, 23, 59, 59)

    const expenses = await prisma.expense.findMany({
      where: {
        userId: dbUser.id,
        date: { gte: yearStart, lte: yearEnd },
      },
      orderBy: { date: 'asc' },
    })

    // Group by Schedule C category
    const byCategory: Record<
      string,
      { total: number; count: number; deductibleAmount: number }
    > = {}

    let totalDeductible = 0
    let totalPartial = 0

    for (const exp of expenses) {
      const cat = exp.category || 'Uncategorized'
      if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0, deductibleAmount: 0 }
      byCategory[cat].total += exp.amount
      byCategory[cat].count += 1

      if (exp.deductibility === 'deductible') {
        byCategory[cat].deductibleAmount += exp.amount
        totalDeductible += exp.amount
      } else if (exp.deductibility === 'likely_deductible') {
        byCategory[cat].deductibleAmount += exp.amount
        totalDeductible += exp.amount
      } else if (exp.deductibility === 'partial') {
        const partial = exp.amount * 0.5 // default 50%
        byCategory[cat].deductibleAmount += partial
        totalPartial += partial
        totalDeductible += partial
      }
    }

    // Tax savings estimate
    const bracketMap: Record<string, number> = {
      '10': 0.1, '12': 0.12, '22': 0.22,
      '24': 0.24, '32': 0.32, '35': 0.35, '37': 0.37,
    }
    const bracketStr = (dbUser.taxBracket || '22').replace(/[^0-9]/g, '')
    const taxRate = bracketMap[bracketStr] || 0.22
    const effectiveRate = taxRate + 0.0765

    const categoryBreakdown = Object.entries(byCategory)
      .map(([category, data]) => ({
        category,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
        deductibleAmount: Math.round(data.deductibleAmount * 100) / 100,
      }))
      .sort((a, b) => b.deductibleAmount - a.deductibleAmount)

    return NextResponse.json({
      year,
      summary: {
        totalExpenses: Math.round(expenses.reduce((s, e) => s + e.amount, 0) * 100) / 100,
        totalDeductible: Math.round(totalDeductible * 100) / 100,
        totalPartialDeductions: Math.round(totalPartial * 100) / 100,
        estimatedTaxSavings: Math.round(totalDeductible * effectiveRate * 100) / 100,
        taxBracket: dbUser.taxBracket || '22%',
        effectiveRate: Math.round(effectiveRate * 100),
        expenseCount: expenses.length,
      },
      categoryBreakdown,
      occupation: dbUser.occupation,
    })
  } catch (err) {
    console.error('Summary error:', err)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
