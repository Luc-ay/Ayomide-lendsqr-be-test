import express from 'express'
import {
  getTransactionById,
  getAllTransactions,
  fundAccount,
  transferFund,
  withdrawFunds,
  getAccountDetails,
} from '../controller/transactionController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/transfer', authenticateToken, transferFund)

router.post('/fund', authenticateToken, fundAccount)

router.post('/withdraw', authenticateToken, withdrawFunds)

router.get('/account', getAccountDetails)

router.get('/transaction/:id', authenticateToken, getTransactionById)

router.get('/', authenticateToken, getAllTransactions)

export default router
