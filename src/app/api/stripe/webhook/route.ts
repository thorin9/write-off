import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder', {
  apiVersion: '2026-02-25.clover',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.customer && session.mode === 'subscription') {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: session.customer as string },
          })
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { planType: 'pro' },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: sub.customer as string },
        })
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { planType: 'free' },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        // Could send an email here
        console.log('Payment failed for customer:', (event.data.object as Stripe.Invoice).customer)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
