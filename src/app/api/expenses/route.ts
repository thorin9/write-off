import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const deductibility = searchParams.get('deductibility')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50

    const where: Record<string, unknown> = { userId: dbUser.id }
    if (fileId) where.uploadedFileId = fileId
    if (deductibility) where.deductibility = deductibility
    if (search) where.merchant = { contains: search, mode: 'insensitive' }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ])

    return NextResponse.json({ expenses, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Get expenses error:', err)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name,
        },
      })
    }

    const body = await request.json()
    const { date, merchant, amount, category, notes, description } = body

    if (!date || !merchant || !amount) {
      return NextResponse.json({ error: 'date, merchant, and amount are required' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        userId: dbUser.id,
        date: new Date(date),
        merchant,
        amount: parseFloat(amount),
        category,
        notes,
        description,
        source: 'manual',
      },
    })

    return NextResponse.json({ expense })
  } catch (err) {
    console.error('Create expense error:', err)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { id, ...updates } = body

    const existing = await prisma.expense.findFirst({ where: { id, userId: dbUser.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(updates.date && { date: new Date(updates.date) }),
        ...(updates.merchant && { merchant: updates.merchant }),
        ...(updates.amount !== undefined && { amount: parseFloat(updates.amount) }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.reviewed !== undefined && { reviewed: updates.reviewed }),
      },
    })

    return NextResponse.json({ expense })
  } catch (err) {
    console.error('Update expense error:', err)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.expense.deleteMany({ where: { id, userId: dbUser.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete expense error:', err)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
