import express from 'express'
import {
  login,
  // logout,
  // deleteUser,
  register,
} from '../controller/userController'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

export default router
