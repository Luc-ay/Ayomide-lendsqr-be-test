import express from 'express'
import {
  userLogin,
  editUserProfile,
  logoutController,
  registerUser,
  createaccountPin,
  getUserbyID,
} from '../controller/userController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', userLogin)
router.get('/user/:id', authenticateToken, getUserbyID)
router.post('/user/create-pin/:id', authenticateToken, createaccountPin)
router.patch('/user/:id', authenticateToken, editUserProfile)
router.post('/logout', authenticateToken, logoutController)

export default router
