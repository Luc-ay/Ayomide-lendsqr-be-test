import { Request, Response, NextFunction } from 'express'
import redisClient from '../utils/redis'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' })
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const storedToken = await redisClient.get(`token:${decoded.id}`)

    if (storedToken !== token) {
      return res.status(401).json({ message: 'Token expired or invalidated' })
    }

    ;(req as any).user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' })
  }
}
