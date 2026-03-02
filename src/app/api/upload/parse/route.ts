import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

type RawExpense = {
  date: string
  merchant: string
  amount: number
  description?: string
}

// Normalize CSV rows from various bank formats
function normalizeCSVRow(row: Record<string, string>): RawExpense | null {
  const keys = Object.keys(row).map(k => k.toLowerCase().trim())

  const dateKey = keys.find(k => k.includes('date') || k.includes('posted') || k.includes('transaction'))
  const amountKey = keys.find(k =>
    k.includes('amount') || k.includes('debit') || k.includes('charge') || k.includes('withdrawal')
  )
  const merchantKey = keys.find(k =>
    k.includes('description') || k.includes('merchant') || k.includes('payee') || k.includes('name')
  )

  if (!dateKey || !amountKey || !merchantKey) return null

  const originalKeys = Object.keys(row)
  const getVal = (lowerKey: string) => {
    const originalKey = originalKeys.find(k => k.toLowerCase().trim() === lowerKey)
    return originalKey ? row[originalKey] : ''
  }

  const amountStr = getVal(amountKey).replace(/[$,()]/g, '').trim()
  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount === 0) return null

  const merchant = getVal(merchantKey).trim()
  if (!merchant) return null

  return {
    date: getVal(dateKey).trim(),
    merchant: merchant.substring(0, 100),
    amount: Math.abs(amount),
    description: merchant,
  }
}

// Parse PDF text into expenses (heuristic extraction)
function parsePDFText(text: string): RawExpense[] {
  const expenses: RawExpense[] = []
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const patterns = [
    /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(.+?)\s+\$?([\d,]+\.\d{2})/,
    /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([\d,]+\.\d{2})/,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+(.+?)\s+([\d,]+\.\d{2})/i,
  ]

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const amount = parseFloat(match[3].replace(',', ''))
        if (amount > 0 && amount < 100000) {
          expenses.push({
            date: match[1],
            merchant: match[2].trim().substring(0, 100),
            amount,
            description: match[2].trim(),
          })
        }
        break
      }
    }
  }

  return expenses
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
          name: user.user_metadata?.full_name || null,
        },
      })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const fileName = file.name
    const fileType = file.type
    let expenses: RawExpense[] = []

    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      const text = await file.text()
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
      })

      for (const row of result.data) {
        const normalized = normalizeCSVRow(row)
        if (normalized) expenses.push(normalized)
      }
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      expenses = parsePDFText(pdfData.text)
    } else if (fileType.startsWith('image/')) {
      expenses = []
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, CSV, or image.' }, { status: 400 })
    }

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId: dbUser.id,
        fileName,
        fileType: fileType.startsWith('image/') ? 'image' : fileName.endsWith('.csv') ? 'csv' : 'pdf',
        status: 'done',
        expenseCount: expenses.length,
      },
    })

    if (expenses.length > 0) {
      await prisma.expense.createMany({
        data: expenses.map(exp => ({
          userId: dbUser!.id,
          uploadedFileId: uploadedFile.id,
          date: isNaN(Date.parse(exp.date)) ? new Date() : new Date(exp.date),
          merchant: exp.merchant,
          amount: exp.amount,
          description: exp.description,
          source: 'upload',
        })),
      })
    }

    return NextResponse.json({
      fileId: uploadedFile.id,
      fileName,
      expenses,
    })
  } catch (err) {
    console.error('Upload parse error:', err)
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 })
  }
}
