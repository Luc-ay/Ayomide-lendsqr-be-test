import db from '../config/db'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../dtos/userDto'
import redisClient from 'src/utils/redis'
import { JWT_SECRET } from 'src/controller/userController'

// Create a new user (with hashed password)
export const createUser = async (
  user: Omit<User, 'id' | 'created_on' | 'updated_on'>
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(user.password, 12)

  const [userId] = await db<User>('users').insert({
    ...user,
    password: hashedPassword,
    email: user.email.toLowerCase(),
  })

  const newUser = await db<User>('users').where({ id: userId }).first()
  return newUser!
}

// Login user and verify password
export const loginUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user = await db<User>('users')
    .where({ email: email.toLowerCase() })
    .first()
  if (!user) return null

  const passwordMatch = await bcrypt.compare(password, user.password)
  return passwordMatch ? user : null
}

// Find user by email
export const findUserByEmail = async (
  email: string
): Promise<User | undefined> => {
  return db<User>('users').where({ email: email.toLowerCase() }).first()
}

export const getAllUsers = async (): Promise<User[]> => {
  return db<User>('users').select('*')
}

// Find User by phone number
export const checkPhoneNumber = async (
  phone_number: string
): Promise<User | undefined> => {
  return db<User>('users').where({ phone_number: phone_number }).first()
}

// Find user by ID
export const findUserById = async (id: number): Promise<User | undefined> => {
  return db<User>('users').where({ id }).first()
}

export const updateUserProfile = async (
  userId: number,
  updates: Partial<User>
) => {
  await db('users')
    .where({ id: userId })
    .update({
      ...updates,
      updated_at: new Date(),
    })

  return db('users').where({ id: userId }).first()
}

export const logoutService = async (token: string) => {
  try {
    const payload: any = Jwt.verify(token, JWT_SECRET)
    const redisKey = `token:${payload.id}`

    const storedToken = await redisClient.get(redisKey)
    if (!storedToken || storedToken !== token) {
      return { success: false, message: 'Token expired or invalidated' }
    }

    await redisClient.del(redisKey)
    return { success: true, message: 'Logged out successfully' }
  } catch (err) {
    return { success: false, message: 'Invalid or expired token' }
  }
}
