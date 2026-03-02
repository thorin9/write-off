import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

export const dynamic = 'force-dynamic'

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
      orderBy: { date: 'asc' },
    })

    const rows = expenses.map((e) => ({
      Date: new Date(e.date).toLocaleDateString('en-US'),
      Merchant: e.merchant,
      Amount: e.amount.toFixed(2),
      Category: e.category || '',
      Deductibility: e.deductibility || 'pending',
      'Confidence (%)': e.confidence ? Math.round(e.confidence) : '',
      'IRS Explanation': e.aiExplanation || '',
      'IRS Reference': e.irsReference || '',
      Notes: e.notes || '',
      Source: e.source,
      Reviewed: e.reviewed ? 'Yes' : 'No',
    }))

    const csv = Papa.unparse(rows)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="write-off-expenses-${year}.csv"`,
      },
    })
  } catch (err) {
    console.error('CSV export error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
