import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { occupation, taxBracket } = await request.json()

    // Upsert user in database
    await prisma.user.upsert({
      where: { supabaseId: user.id },
      update: {
        occupation,
        taxBracket,
        onboardingDone: true,
      },
      create: {
        email: user.email!,
        name: user.user_metadata?.name ?? null,
        supabaseId: user.id,
        occupation,
        taxBracket,
        onboardingDone: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
