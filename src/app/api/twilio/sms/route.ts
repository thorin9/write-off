import { NextRequest } from 'next/server'
import { analyzeExpense } from '@/lib/ai/analyzer'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type UserWithPhone = {
  id: string
  occupation: string | null
  phone: string | null
}

function parseExpenseFromSMS(text: string): { amount: number; merchant: string; description: string } | null {
  const patterns = [
    /\$?([\d.]+)\s+(?:at\s+)?(.+)/i,
    /spent\s+\$?([\d.]+)\s+(?:at\s+)?(.+)/i,
    /([\d.]+)\s+dollars?\s+(?:at\s+)?(.+)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = parseFloat(match[1])
      const merchant = match[2].trim().substring(0, 100)
      if (!isNaN(amount) && amount > 0 && merchant) {
        return { amount, merchant, description: text.trim() }
      }
    }
  }
  return null
}

function formatTwilioResponse(message: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`,
    {
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body = formData.get('Body')?.toString() || ''
    const from = formData.get('From')?.toString() || ''

    if (!body.trim()) {
      return formatTwilioResponse(
        "Hi! Text me an expense like: \"$84 at Staples for office supplies\" and I'll analyze it for tax deductibility."
      )
    }

    const user = await prisma.user
      .findFirst({
        where: { phone: from },
        select: { id: true, occupation: true, phone: true },
      })
      .catch(() => null) as UserWithPhone | null

    const parsed = parseExpenseFromSMS(body)

    if (!parsed) {
      return formatTwilioResponse(
        'I couldn\'t parse that as an expense. Try: "$84 at Staples for office supplies" or "Spent $200 at Adobe for software"'
      )
    }

    const analysis = await analyzeExpense(
      parsed.merchant,
      parsed.amount,
      parsed.description,
      user?.occupation ?? null
    )

    if (user) {
      await prisma.expense.create({
        data: {
          userId: user.id,
          date: new Date(),
          merchant: parsed.merchant,
          amount: parsed.amount,
          description: parsed.description,
          category: analysis.category,
          deductibility: analysis.deductibility,
          confidence: analysis.confidence,
          aiExplanation: analysis.explanation,
          irsReference: analysis.irs_reference,
          source: 'sms',
        },
      })
    }

    const verdictEmoji =
      ({
        deductible: '✅',
        likely_deductible: '🟡',
        not_deductible: '🔴',
        partial: '⚠️',
      } as Record<string, string>)[analysis.deductibility] || '❓'

    const verdictLabel =
      ({
        deductible: 'DEDUCTIBLE',
        likely_deductible: 'LIKELY DEDUCTIBLE',
        not_deductible: 'NOT DEDUCTIBLE',
        partial: 'PARTIALLY DEDUCTIBLE',
      } as Record<string, string>)[analysis.deductibility] || 'UNKNOWN'

    const responseText = `${verdictEmoji} $${parsed.amount.toFixed(2)} at ${parsed.merchant}

${verdictLabel} (${Math.round(analysis.confidence)}% confidence)
Category: ${analysis.category}

${analysis.explanation}

${analysis.irs_reference}${user ? '\n\n✓ Saved to your Write-Off account.' : '\n\nSign up at writeoff.app to save this.'}`

    return formatTwilioResponse(responseText)
  } catch (err) {
    console.error('Twilio SMS error:', err)
    return formatTwilioResponse('Sorry, something went wrong processing your expense. Please try again.')
  }
}
