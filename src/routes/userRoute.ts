import express from 'express'
import {
  // login,
  // logout,
  // deleteUser,
  registerUser,
} from '../controller/userController'

const router = express.Router()

router.post('/register', registerUser)
// router.post('/login', login)

export default router
