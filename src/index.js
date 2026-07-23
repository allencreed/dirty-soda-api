import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import menuRoutes from './routes/menu.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import webhookRoutes from './routes/webhooks.js'
import adminMenuRoutes from './routes/admin-menu.js'
import { clerkAuth } from './middleware/clerk.js'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()

async function bootstrap() {
  // Auto-seed menu if DB is empty
  const itemCount = await prisma.menuItem.count()
  if (!itemCount) {
    const itemData = [
      {
        name: 'Classic Dirty Soda',
        description: 'Soda, cream, vanilla',
        basePrice: 5.99,
        category: 'signature',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60',
      },
      {
        name: 'Dirty Chai',
        description: 'Chai, espresso, oat milk',
        basePrice: 6.49,
        category: 'signature',
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=60',
      },
      {
        name: 'Berry Fizz',
        description: 'Mixed berries, lemon-lime soda',
        basePrice: 5.49,
        category: 'classic',
        image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=60',
      },
      {
        name: 'Orange Creamsicle',
        description: 'Orange soda, vanilla ice cream',
        basePrice: 6.99,
        category: 'signature',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60',
      },
    ]

    const seedOptions = itemData.map((data) => prisma.menuItem.create({ data }))
    const seeded = await Promise.all(seedOptions)

    const firstId = seeded[0].id
    await prisma.modifier.createMany({
      data: [
        { name: 'Extra Syrup', priceDelta: 0.5, menuItemId: firstId },
        { name: 'Cream Top', priceDelta: 0.75, menuItemId: firstId },
        { name: 'Add Espresso Shot', priceDelta: 1.0, menuItemId: firstId },
      ],
    })
    console.log('Seeded initial menu data')
  }

  const app = express()
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    })
  )

  // Raw parser FIRST for Stripe webhooks, before JSON parser
  app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)
  app.use(express.json())

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api/menu', menuRoutes)
  app.use('/api/cart', clerkAuth, cartRoutes)
  app.use('/api/orders', clerkAuth, orderRoutes)
  app.use('/api/admin/menu', clerkAuth, adminMenuRoutes)

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap API:', error)
  process.exit(1)
})
