import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyzeExpense, analyzeExpenseBatch } from '@/lib/ai/analyzer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { expenseId, fileId } = body

    if (expenseId) {
      const expense = await prisma.expense.findFirst({
        where: { id: expenseId, userId: dbUser.id },
      })
      if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 })

      const analysis = await analyzeExpense(
        expense.merchant,
        expense.amount,
        expense.description,
        dbUser.occupation
      )

      const updated = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          category: analysis.category,
          deductibility: analysis.deductibility,
          confidence: analysis.confidence,
          aiExplanation: analysis.explanation,
          irsReference: analysis.irs_reference,
        },
      })

      return NextResponse.json({ expense: updated, analysis })
    }

    if (fileId) {
      const expenses = await prisma.expense.findMany({
        where: { uploadedFileId: fileId, userId: dbUser.id, deductibility: null },
        take: 100,
      })

      if (expenses.length === 0) {
        return NextResponse.json({ message: 'No unanalyzed expenses found', count: 0 })
      }

      const analyses = await analyzeExpenseBatch(
        expenses.map(e => ({ id: e.id, merchant: e.merchant, amount: e.amount, description: e.description })),
        dbUser.occupation
      )

      await Promise.all(
        expenses.map(expense => {
          const analysis = analyses.get(expense.id)
          if (!analysis) return Promise.resolve()
          return prisma.expense.update({
            where: { id: expense.id },
            data: {
              category: analysis.category,
              deductibility: analysis.deductibility,
              confidence: analysis.confidence,
              aiExplanation: analysis.explanation,
              irsReference: analysis.irs_reference,
            },
          })
        })
      )

      return NextResponse.json({ count: expenses.length, message: 'Analysis complete' })
    }

    return NextResponse.json({ error: 'Provide expenseId or fileId' }, { status: 400 })
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
