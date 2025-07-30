import { Request, Response } from 'express'
import { stat } from 'fs'
import { fundWalletSchema, transferFundsSchema } from 'src/dtos/validationDto'
import { findAccountByUserId } from 'src/services/accountServices'
import { fundWallet, transferFunds } from 'src/services/transactionService'

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
export const transferFund = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id)

    const account = await findAccountByUserId(userId)
    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    const { recipient_account, amount, transaction_pin } = req.body

    const sender_account = account.account_number

    const transfer = await transferFunds({
      recipient_account,
      amount,
      transaction_pin,
      sender_account,
    })
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer failed' })
    }
    return res.status(200).json({
      message: 'Transfer successful',
      amount: `#${amount}`,
      recipient_account: transfer.recipient.account_number,
      name: transfer.recipient.recipient_name,
      reference: transfer.reference,
      transaction_time: transfer.transaction_time,
    })
  } catch (error: any) {
    console.error('[Transfer Error]', error.message)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const withdrawFunds = async (req: Request, res: Response) => {}

export const getAccountDetails = async (req: Request, res: Response) => {}

export const getTransactionById = async (req: Request, res: Response) => {}

export const getAllTransactions = async (req: Request, res: Response) => {}
