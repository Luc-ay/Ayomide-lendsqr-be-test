import express from 'express'
import {
  getUsers,
  userLogin,
  editUserProfile,
  logoutController,
  registerUser,
  createaccountPin,
  getUserbyID,
} from '../controller/userController'
import { authenticateToken } from 'src/middleware/authMiddleware'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', userLogin)
router.get('/users', getUsers)
router.get('/user/:id', authenticateToken, getUserbyID)
router.post('/user/:id', authenticateToken, createaccountPin)
router.patch('/user/:id', authenticateToken, editUserProfile)
router.post('/logout', authenticateToken, logoutController)

export default router
