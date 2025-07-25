// src/controllers/user.controller.ts
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import {
  createUser,
  findUserByEmail,
  loginUser,
} from 'src/services/userService'

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  /* 
   future improvement:
   - First recieves the user phone number and verifies it via OTP
   - Then allows the user to register with name, email, and password
*/
  try {
    if (!name || !email || !password) {
      throw { status: 400, publicMessage: 'All fields are required' }
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ message: 'User already exist' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await createUser({ name, email, password: hashedPassword })
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error('Registration error:', error) // Logs full details for debugging

    return res
      .status(500)
      .json({ message: 'Something went wrong. Please try again later.' })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const user = await loginUser(email, password)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    })
  } catch (error) {
    console.error('Registration error:', error) // Logs full details for debugging

    return res
      .status(500)
      .json({ message: 'Something went wrong. Please try again later.' })
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
