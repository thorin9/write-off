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

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        occupation: dbUser.occupation,
        taxBracket: dbUser.taxBracket,
        planType: dbUser.planType,
        onboardingDone: dbUser.onboardingDone,
      },
    })
  } catch (err) {
    console.error('Get profile error:', err)
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { name, occupation, taxBracket } = body

    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(occupation !== undefined && { occupation: occupation || null }),
        ...(taxBracket !== undefined && { taxBracket: taxBracket || null }),
      },
    })

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        occupation: updated.occupation,
        taxBracket: updated.taxBracket,
        planType: updated.planType,
      },
    })
  } catch (err) {
    console.error('Update profile error:', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
