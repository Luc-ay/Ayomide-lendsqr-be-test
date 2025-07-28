import express from 'express'
import {
  getUsers,
  userLogin,
  // logout,
  // deleteUser,
  registerUser,
  getUsersbyID,
} from '../controller/userController'
import { loginUser } from 'src/services/userService'
import { authenticateToken } from 'src/middleware/authMiddleware'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', userLogin)
router.get('/users', getUsers)
router.get('/user/:id', authenticateToken, getUsersbyID)

export default router
