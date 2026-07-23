import express from 'express'
import { PrismaClient } from '@prisma/client'
const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  const items = await prisma.menuItem.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

router.post('/', async (req, res) => {
  const { name, description, basePrice, image, category, isActive } = req.body
  const item = await prisma.menuItem.create({ data: { name, description, basePrice, image, category, isActive } })
  res.status(201).json(item)
})

router.put('/:id', async (req, res) => {
  const { name, description, basePrice, image, category, isActive } = req.body
  const item = await prisma.menuItem.update({ where: { id: req.params.id }, data: { name, description, basePrice, image, category, isActive } })
  res.json(item)
})

router.delete('/:id', async (req, res) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
