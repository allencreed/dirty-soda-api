import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.modifier.deleteMany()
  await prisma.menuItem.deleteMany()

  const a = await prisma.menuItem.create({ data: { name: 'Classic Dirty Soda', description: 'Soda, cream, vanilla', basePrice: 5.99, category: 'signature', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60' } })
  await prisma.menuItem.create({ data: { name: 'Dirty Chai', description: 'Chai, espresso, oat milk', basePrice: 6.49, category: 'signature', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=60' } })
  await prisma.menuItem.create({ data: { name: 'Berry Fizz', description: 'Mixed berries, lemon-lime soda', basePrice: 5.49, category: 'classic', image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=60' } })
  await prisma.menuItem.create({ data: { name: 'Orange Creamsicle', description: 'Orange soda, vanilla ice cream', basePrice: 6.99, category: 'signature', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60' } })
  await prisma.modifier.createMany({ data: [
    { name: 'Extra Syrup', priceDelta: 0.50, menuItemId: a.id },
    { name: 'Cream Top', priceDelta: 0.75, menuItemId: a.id },
    { name: 'Add Espresso Shot', priceDelta: 1.00, menuItemId: a.id }
  ] })
  console.log('Re-seeded with images!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
