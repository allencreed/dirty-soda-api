import { clerkClient, verifyToken } from '@clerk/clerk-sdk-node'

export async function clerkAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'missing token' })
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}
