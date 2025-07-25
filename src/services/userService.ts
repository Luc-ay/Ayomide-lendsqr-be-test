import db from '../config/db'
import bcrypt from 'bcryptjs'
import { User } from '../dtos/validationDto'

export const createUser = async (
  user: Omit<User, 'id' | 'created_at' | 'updated_at'>
): Promise<User> => {
  const [insertedId] = await db<User>('users').insert(user)
  const newUser = await db<User>('users').where({ id: insertedId }).first()
  return newUser!
}

export const loginUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user = await db<User>('users').where({ email }).first()
  if (!user) return null

  const passwordMatch = await bcrypt.compare(password, user.password)
  return passwordMatch ? user : null
}

export const findUserByEmail = async (
  email: string
): Promise<User | undefined> => {
  return db<User>('users').where({ email }).first()
}

// export const findUserById = async (id: number): Promise<User | undefined> => {
//   return db<User>('users').where({ id }).first()
// }

// export const deleteUserById = async (id: number): Promise<number> => {
//   return db<User>('users').where({ id }).delete()
// }
