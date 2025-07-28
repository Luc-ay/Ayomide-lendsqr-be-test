import express from 'express'
import {
  getUsers,
  userLogin,
  // logout,
  // deleteUser,
  registerUser,
} from '../controller/userController'
import { loginUser } from 'src/services/userService'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', userLogin)
router.get('/users', getUsers)

export default router
