import express from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const router = express.Router()
const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).send('Webhook Error')
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.orderId
    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId },
        data: { status: 'paid', stripePaymentIntentId: session.payment_intent?.toString() || null }
      })
    }
  }

  res.json({ received: true })
})

export default router
