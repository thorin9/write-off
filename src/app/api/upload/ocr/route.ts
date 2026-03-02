import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' },
            },
            {
              type: 'text',
              text: `You are an OCR system for receipt parsing. Extract the following from this receipt/image and return ONLY valid JSON (no markdown):
{
  "merchant": "store or vendor name",
  "date": "YYYY-MM-DD or as found",
  "total": 0.00,
  "items": [{"description": "...", "amount": 0.00}],
  "tax": 0.00,
  "subtotal": 0.00
}
If you cannot find a field, use null. Extract the TOTAL amount spent (not individual items unless total is missing).`,
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const content = response.choices[0].message.content || '{}'
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      parsed = { merchant: 'Unknown', date: null, total: null }
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('OCR error:', err)
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 })
  }
}
