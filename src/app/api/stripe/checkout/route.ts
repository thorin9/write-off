import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder', {
  apiVersion: '2026-02-25.clover',
})

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(_request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'placeholder') {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${APP_URL}/auth/login`)

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.redirect(`${APP_URL}/auth/login`)

    if (dbUser.planType === 'pro') {
      return NextResponse.redirect(`${APP_URL}/dashboard/settings`)
    }

    // Create or retrieve Stripe customer
    let customerId = dbUser.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name || undefined,
        metadata: { userId: dbUser.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: PRO_PRICE_ID
        ? [{ price: PRO_PRICE_ID, quantity: 1 }]
        : [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Write-Off Pro',
                  description: 'Unlimited expenses, exports, SMS, priority AI',
                },
                unit_amount: 1200, // $12.00
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
      success_url: `${APP_URL}/dashboard/settings?upgraded=1`,
      cancel_url: `${APP_URL}/dashboard/settings`,
    })

    return NextResponse.redirect(session.url!)
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?error=1`)
  }
}
