// src/controllers/user.controller.ts
import { Request, Response } from 'express'
import {
  checkPhoneNumber,
  createUser,
  findUserByEmail,
  loginUser,
} from '../services/userService'
import axios from 'axios'
import bcrypt from 'bcryptjs'
import { checkBlacklist } from 'src/utils/karmaLookup'
import { User } from 'src/dtos/userDto'

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
      blacklistCheck.blacklisted // if you're extracting this in your function
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
      verified: false,
      blacklisted: false,
    })

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

    // Check if user is blacklisted
    if (user.blacklisted) {
      return res.status(403).json({
        message: 'Login denied: You are listed on the financial blacklist.',
        reason: 'Flagged by Adjutor API',
      })
    }

    // Remove password from response
    const { password: _, ...safeUser } = user
    return res.status(200).json({
      message: 'Login successfully',
    })
  } catch (error: any) {
    console.error('[Login Error]', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// export const logout = async (_req: Request, res: Response) => {
//   try {
//     const result = await logoutUser()
//     return res.status(200).json(result)
//   } catch (error) {
//     return res.status(500).json({ message: 'Server error', error })
//   }
// }

// export const deleteUser = async (req: Request, res: Response) => {
//   const userId = Number(req.params.id)

//   try {
//     const deleted = await deleteAccount(userId)
//     if (!deleted) return res.status(404).json({ message: 'User not found' })

//     return res.status(200).json({ message: 'Account deleted successfully' })
//   } catch (error) {
//     return res.status(500).json({ message: 'Server error', error })
//   }
// }
