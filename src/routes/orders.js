import express from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const router = express.Router()
const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

router.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({ where: { clerkUserId: req.user.sub }, orderBy: { createdAt: 'desc' } })
  res.json(orders)
})

router.post('/session', async (req, res) => {
  const { items, total = 0 } = req.body
  const order = await prisma.order.create({
    data: {
      clerkUserId: req.user.sub,
      total,
      items: JSON.stringify(items || []),
      status: 'pending'
    }
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/orders?status=success`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/cart?status=cancel`,
    line_items: (Array.isArray(items) ? items : []).map((item) => {
      const unit = Math.round((item.basePrice || 0) * 100)
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: item.name || 'Item' },
          unit_amount: unit
        },
        quantity: item.quantity || 1
      }
    }),
    metadata: { clerkUserId: req.user.sub, orderId: order.id }
  })

  res.json({ url: session.url, orderId: order.id })
})

export default router
