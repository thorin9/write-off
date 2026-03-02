import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ stats: null })

    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // All expenses this year
    const expenses = await prisma.expense.findMany({
      where: {
        userId: dbUser.id,
        date: { gte: yearStart },
      },
      select: {
        amount: true,
        deductibility: true,
        date: true,
        reviewed: true,
      },
    })

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

    const deductibleExpenses = expenses.filter(
      (e) => e.deductibility === 'deductible' || e.deductibility === 'likely_deductible'
    )
    const totalDeductible = deductibleExpenses.reduce((s, e) => s + e.amount, 0)

    // Estimate tax savings based on bracket
    const bracketMap: Record<string, number> = {
      '10%': 0.1, '12%': 0.12, '22%': 0.22,
      '24%': 0.24, '32%': 0.32, '35%': 0.35, '37%': 0.37,
    }
    const bracketKey = Object.keys(bracketMap).find((k) =>
      (dbUser.taxBracket || '').includes(k.replace('%', ''))
    )
    const taxRate = bracketKey ? bracketMap[bracketKey] : 0.22
    // Self-employment tax deduction (half of 15.3%)
    const effectiveRate = taxRate + 0.0765
    const estimatedSavings = totalDeductible * effectiveRate

    const confirmedDeductions = expenses.filter((e) => e.deductibility === 'deductible').length
    const pendingReview = expenses.filter((e) => !e.deductibility).length

    // Monthly breakdown (last 12 months)
    const monthlyData: Record<string, { deductible: number; nonDeductible: number }> = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      monthlyData[key] = { deductible: 0, nonDeductible: 0 }
    }

    const allExpenses = await prisma.expense.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
        },
      },
      select: { amount: true, deductibility: true, date: true },
    })

    for (const exp of allExpenses) {
      const d = new Date(exp.date)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (!monthlyData[key]) continue
      if (exp.deductibility === 'deductible' || exp.deductibility === 'likely_deductible') {
        monthlyData[key].deductible += exp.amount
      } else {
        monthlyData[key].nonDeductible += exp.amount
      }
    }

    const chartData = Object.entries(monthlyData).map(([month, vals]) => ({
      month,
      deductible: Math.round(vals.deductible),
      nonDeductible: Math.round(vals.nonDeductible),
    }))

    // Recent expenses for activity feed
    const recent = await prisma.expense.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        merchant: true,
        amount: true,
        deductibility: true,
        date: true,
        source: true,
      },
    })

    return NextResponse.json({
      stats: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalDeductible: Math.round(totalDeductible * 100) / 100,
        estimatedSavings: Math.round(estimatedSavings * 100) / 100,
        confirmedDeductions,
        pendingReview,
        taxRate: Math.round(effectiveRate * 100),
      },
      chartData,
      recent,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
