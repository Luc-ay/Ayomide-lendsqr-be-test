import { Request, Response } from 'express'
import { stat } from 'fs'
import {
  fundWalletSchema,
  transferFundsSchema,
  withdrawFundsSchema,
} from 'src/dtos/validationDto'
import { findAccount, findAccountByUserId } from 'src/services/accountServices'
import {
  allTransactions,
  fundWallet,
  transactionById,
  transferFunds,
  withdrawFunds,
} from 'src/services/transactionService'

// Fund a user wallet
export const fundAccount = async (req: Request, res: Response) => {
  try {
    const { error, value } = fundWalletSchema.validate(req.body, {
      abortEarly: false,
    })

    if (error) {
      const errors = error.details.map((detail) => detail.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }

    const { account_number, amount, source } = value

    const account = await fundWallet(value)

    return res.status(200).json({
      message: 'Wallet funded successfully',
      amount: `#${amount}`,
      account_number,
      account_name: account.account_name,
      description: account.description,
      transaction_Id: account.reference,
      type: account.type,
      category: account.category,
      date: account.date,
      status: account.status,
    })
  } catch (error: any) {
    console.error('[Register Error]', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Transfer funds between wallets
export const transferFund = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id)

    const { error, value } = transferFundsSchema.validate(req.body, {
      abortEarly: false,
    })

    if (error) {
      const errors = error.details.map((detail) => detail.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }

    const { recipient_account, amount, transaction_pin } = value

    const account = await findAccountByUserId(userId)
    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    const sender_account = account.account_number
    const transfer = await transferFunds({
      ...value,
      sender_account,
    })

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer failed' })
    }

    return res.status(200).json(transfer)
  } catch (error: any) {
    console.error('[Transfer Error]', error.message)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const withdrawFundsController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id)

    const { error, value } = withdrawFundsSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((e) => e.message),
      })
    }

    const { account_number, amount, bank_name, transaction_pin } = value

    const result = await withdrawFunds({
      userId,
      account_number,
      amount,
      bank_name,
      transaction_pin,
    })

    return res.status(200).json({
      message: 'Withdrawal successful',
      data: result,
    })
  } catch (err: any) {
    console.error('[WithdrawFundsController Error]', err.message)
    return res.status(500).json({
      message: 'Withdrawal failed',
      error: err.message,
    })
  }
}

export const getAccountDetails = async (req: Request, res: Response) => {
  try {
    const { account_number } = req.body
    if (!account_number) {
      return res.status(400).json({ message: 'Account number is required' })
    }

    const account = await findAccount(account_number)
    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    return res.status(200).json({
      account_number: account.account_number,
      account_name: account.name,
      account_type: account.account_type,
    })
  } catch (error: any) {
    console.error('[Transfer Error]', error.message)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id)

    const account = await findAccountByUserId(userId)
    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    const transactions = await allTransactions(userId)

    return res
      .status(200)
      .json({ transactions, transaction: transactions.length })
  } catch (error: any) {
    console.error('[Get Transactions Error]', error.message)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transactionId = Number(req.params.id)
    const userId = Number(req.user?.id)

    if (!transactionId || isNaN(transactionId)) {
      return res
        .status(400)
        .json({ message: 'Valid transaction ID is required' })
    }

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const account = await findAccountByUserId(userId)
    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    const transaction = await transactionById(transactionId, Number(account.id))

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    return res.status(200).json(transaction)
  } catch (error: any) {
    console.error('[Get Transaction Error]', error.message)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Get transactions by category
export const getTransactionByCategory = async (
  req: Request,
  res: Response
) => {}

// Get transactions by type (debit/credit)
export const getTransactionByType = async (req: Request, res: Response) => {}
