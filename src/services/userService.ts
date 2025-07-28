import db from '../config/db'
import bcrypt from 'bcryptjs'
import { User } from '../dtos/userDto'

// Create a new user (with hashed password)
export const createUser = async (
  user: Omit<User, 'id' | 'created_on' | 'updated_on'>
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(user.password, 12)

  const [userId] = await db<User>('users').insert({
    ...user,
    password: hashedPassword,
    email: user.email.toLowerCase(), // normalize
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
export const checkPhoneNumber = async (
  phone_number: string
): Promise<User | undefined> => {
  return db<User>('users').where({ phone_number: phone_number }).first()
}

// Find user by ID
export const findUserById = async (id: number): Promise<User | undefined> => {
  return db<User>('users').where({ id }).first()
}

// Delete user (optional, if needed for admin actions)
export const deleteUserById = async (id: number): Promise<number> => {
  return db<User>('users').where({ id }).delete()
}
