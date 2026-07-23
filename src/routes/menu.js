import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const items = await prisma.menuItem.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
  res.json(items)
})

export default router
