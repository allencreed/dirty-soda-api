import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const items = await prisma.cartItem.findMany({ where: { clerkUserId: req.user.sub }, orderBy: { createdAt: 'desc' } })
  res.json(items)
})

router.put('/', async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : []
  await prisma.cartItem.deleteMany({ where: { clerkUserId: req.user.sub } })
  await prisma.cartItem.createMany({
    data: items.map((item) => ({
      clerkUserId: req.user.sub,
      menuItemId: item.menuItemId,
      name: item.name || '',
      description: item.description || '',
      basePrice: item.basePrice || 0,
      image: item.image || null,
      category: item.category || 'sodas',
      isActive: item.isActive ?? true,
      modifiers: JSON.stringify(Array.isArray(item.modifiers) ? item.modifiers : []),
      quantity: item.quantity || 1,
    })),
  })
  res.json({ ok: true })
})

export default router
