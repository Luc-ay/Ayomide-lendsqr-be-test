// src/controllers/user.controller.ts
import { Request, Response } from 'express'
import Jwt from 'jsonwebtoken'
import redisClient from '../utils/redis'
import {
  checkPhoneNumber,
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  loginUser,
  logoutService,
  updateUserProfile,
} from '../services/userService'
import { checkBlacklist } from 'src/utils/karmaLookup'
import { User } from 'src/dtos/userDto'
import {
  createAccount,
  findAccount,
  findAccountByUserId,
} from 'src/services/accountServices'
import { CreateAccountInput } from 'src/dtos/validationDto'

const JWT_SECRET: any = process.env.JWT_SECRET

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, phone_number, password }: User =
      req.body

    if (!first_name || !last_name || !email || !phone_number || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await findUserByEmail(email.toLowerCase())
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' })
    }

    const phoneNumberExist = await checkPhoneNumber(phone_number)
    if (phoneNumberExist) {
      return res
        .status(409)
        .json({ message: 'phone number is already registered' })
    }

    const blacklistCheck = await checkBlacklist(phone_number)

    if (
      (blacklistCheck as any)?.['mock-response'] ||
      blacklistCheck.blacklisted
    ) {
      return res.status(403).json({
        message:
          'Registration denied: You are listed on the financial blacklist.',
        reason: blacklistCheck.reason || 'Flagged by Adjutor API (mock mode)',
      })
    }

    const newUser = await createUser({
      username: email.split('@')[0],
      email: email.toLowerCase(),
      phone_number,
      password,
      first_name,
      last_name,
      email_verified: false,
      verified: true,
      blacklisted: false,
    })

    // Generate a unique 10-digit account number starting with '021'
    let accountNumber = ''
    let isUnique = false

    while (!isUnique) {
      const randomPart = Math.floor(1000000 + Math.random() * 9000000)
      accountNumber = `021${randomPart}`

      const existing = await findAccount(accountNumber)
      if (!existing) isUnique = true
    }

    // Create the account
    const newAccount: CreateAccountInput = {
      user_id: Number(newUser.id),
      account_number: accountNumber,
      account_type: 'wallet',
      balance: 0,
    }

    const createdAccount = await createAccount(newAccount)

    const { password: _, ...safeUser } = newUser
    return res.status(201).json({
      message: 'User registered successfully',
      user: safeUser,
    })
  } catch (error: any) {
    console.error('[Register Error]', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
// Login user

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password }: User = req.body

    if (!email || !password) {
      return res.status(422).json({ message: 'All fields are required' })
    }

    const userExist = await findUserByEmail(email)
    if (!userExist) {
      return res.status(422).json({ message: 'User not found' })
    }

    const user = await loginUser(email.toLowerCase(), password)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const { password: _, ...safeUser } = user

    // Generate Token
    const token = Jwt.sign(
      { id: safeUser.id, email: safeUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Store token in Redis with expiration
    await redisClient.set(`token:${safeUser.id}`, token, {
      EX: 60 * 60 * 24 * 7, // 7 days
    })

    return res.status(200).json({
      message: 'Login successful',
      token,
    })
  } catch (error: any) {
    console.error('[Login Error]', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUsers = async (req: Request, res: Response) => {
  const users = await getAllUsers()

  if (!users || users.length === 0) {
    return res.status(404).json({ message: 'No users found' })
  }

  return res.status(200).json(users)
}

// Get user by ID
export const getUserbyID = async (req: Request, res: Response) => {
  const userId = Number(req.params.id)

  const users = await findUserById(userId)
  if (!users) {
    return res.status(404).json({ message: 'No users found' })
  }

  const userAccount = await findAccountByUserId(userId)
  if (!userAccount) {
    return res.status(404).json({ message: 'Account not found' })
  }

  return res.status(200).json({
    user: users,
    account_number: userAccount.account_number,
  })
}

// Edit user profile
export const editUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id)

    const {
      username,
      first_name,
      last_name,
      bvn,
      dob,
      profile_pic,
      address,
      apartment_type,
      nearest_landmark,
      city,
      state,
      lga,
      gender,
      marital_status,
      occupation,
      employment_status,
    } = req.body

    const updates = {
      username,
      first_name,
      last_name,
      bvn,
      dob,
      profile_pic,
      address,
      apartment_type,
      nearest_landmark,
      city,
      state,
      lga,
      gender,
      marital_status,
      occupation,
      employment_status,
    }

    const updatedUser = await updateUserProfile(userId, updates)

    return res.status(200).json({
      message: 'Profile updated successfully',
      data: updatedUser,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : error,
    })
  }
}

// logout user
export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  const result = await logoutService(token)

  const status = result.success
    ? 200
    : result.message.includes('expired')
    ? 400
    : 500
  return res.status(status).json({ message: result.message })
}
