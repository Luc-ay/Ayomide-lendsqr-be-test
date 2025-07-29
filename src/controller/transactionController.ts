import { Request, Response } from 'express'
import { stat } from 'fs'
import { fundWalletSchema, transferFundsSchema } from 'src/dtos/validationDto'
import { findAccountByUserId } from 'src/services/accountServices'
import { fundWallet } from 'src/services/transactionService'

// Fund a user wallet
export const fundAccount = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id)
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
      account_number: account.account_number,
      balance: `#${account.balance}`,
      description: account.description,
      transactionId: account.reference,
      date: account.date,
      status: account.status,
    })
  } catch (error: any) {
    console.error('[Register Error]', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Transfer funds between wallets
export const transferFunds = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id)
    const senderAccount = await findAccountByUserId(userId)
    if (!senderAccount) {
      return res.status(404).json({ message: 'Sender account not found' })
    }
    const { error, value } = transferFundsSchema.validate(req.body)
    if (error) {
      const errors = error.details.map((detail) => detail.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }

    const { recipient_account, amount } = value
    const sender_account = senderAccount.account_number
  } catch (error: any) {
    console.error('[Transfer Error]', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const withdrawFunds = async (req: Request, res: Response) => {}

export const getAccountDetails = async (req: Request, res: Response) => {}

export const getTransactionById = async (req: Request, res: Response) => {}

export const getAllTransactions = async (req: Request, res: Response) => {}
