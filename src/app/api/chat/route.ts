import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" })

const CHAT_SYSTEM_PROMPT = `You are "Write-Off AI", a friendly and knowledgeable US tax advisor specializing in self-employed, freelance, and 1099 contractor tax deductions. You are grounded in IRS Publication 535 (Business Expenses) and related IRS guidance.

Your role:
- Answer questions about what expenses are deductible for self-employed workers
- Explain IRS rules in plain English, no jargon
- Always cite the relevant IRS publication or rule when possible
- Always include a confidence level: High / Medium / Low
- For edge cases, recommend consulting a CPA
- Be encouraging but accurate — help users maximize LEGAL deductions only
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists

You are NOT a lawyer or CPA. Always add a brief disclaimer for complex situations.`

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

    const body = await request.json() as { message?: string }
    const message = body.message
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    await prisma.chatMessage.create({
      data: { userId: dbUser.id, role: 'user', content: message },
    })

    const history = await prisma.chatMessage.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    history.reverse()

    const messages = history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const systemWithContext = dbUser.occupation
      ? `${CHAT_SYSTEM_PROMPT}\n\nUser context: This user works as a ${dbUser.occupation}. Tailor your answers to their specific situation when relevant.`
      : CHAT_SYSTEM_PROMPT

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemWithContext },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.3,
    })

    const reply = response.choices[0].message.content || 'I apologize, I could not generate a response.'

    await prisma.chatMessage.create({
      data: { userId: dbUser.id, role: 'assistant', content: reply },
    })

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ messages: [] })

    const messages = await prisma.chatMessage.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('Get chat error:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
