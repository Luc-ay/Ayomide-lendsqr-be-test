import db from '../config/db'
import {
  FundWalletDTO,
  TransferFundsDTO,
  WithdrawFundsDTO,
  TransactionContext,
} from '../dtos/transactionDto'
import { v4 as uuidv4 } from 'uuid'
import { confirmAccountPin, findAccount } from './accountServices'

// Fund a user wallet
export const fundWallet = async ({
  account_number,
  amount,
  source = 'bank',
}: FundWalletDTO) => {
  const trx = await db.transaction()

  try {
    const [account] = await trx('accounts').where({ account_number })
    if (!account) throw new Error('Account not found')

    const [user] = await trx('users')
      .where({ id: account.user_id })
      .select('first_name', 'last_name')
    if (!user) throw new Error('User not found')

    const account_name = `${user.first_name} ${user.last_name}`

    const reference = uuidv4()
    const description = `Wallet funded via ${source}`

    const [transactionId] = await trx('transactions').insert({
      reference,
      receiver_account_id: account.id,
      type: 'credit',
      amount,
      category: 'funding',
      status: 'success',
      description,
      channel: source,
    })
    await trx('accounts').where({ id: account.id }).increment('balance', amount)

    const [transaction] = await trx('transactions').where({ id: transactionId })

    await trx.commit()

    return {
      amount,
      account_number,
      account_name,
      category: transaction.category,
      type: transaction.type,
      description,
      reference,
      date: transaction.created_at,
      status: transaction.status,
    }
  } catch (err) {
    await trx.rollback()
    throw err
  }
}

// Transfer funds between wallets
export const transferFunds = async ({
  sender_account,
  recipient_account,
  amount,
  transaction_pin,
}: TransferFundsDTO) => {
  const trx = await db.transaction()

  try {
    const sender = await trx('accounts')
      .where({ account_number: sender_account })
      .first()

    const recipient = await trx('accounts')
      .where({ account_number: recipient_account })
      .first()

    if (!recipient) throw new Error('Recipient account not found')

    if (recipient.account_number == sender.account_number)
      throw new Error('Cannot transfer to the same account')

    if (!sender || !recipient) throw new Error('Invalid account details')

    const isValidPin = await confirmAccountPin(sender.user_id, transaction_pin)
    if (!isValidPin) throw new Error('Invalid transaction pin')

    const [user] = await trx('users')
      .where({ id: recipient.user_id })
      .select('first_name', 'last_name')
    if (!user) throw new Error('User not found')

    const account_name = `${user.first_name} ${user.last_name}`

    if (parseFloat(sender.balance) < amount)
      throw new Error('Insufficient balance')

    await trx('accounts').where({ id: sender.id }).decrement('balance', amount)
    await trx('accounts')
      .where({ id: recipient.id })
      .increment('balance', amount)

    const now = new Date()
    const groupRef = uuidv4()

    await trx('transactions').insert([
      {
        receiver_account_id: recipient.id,
        sender_account_id: sender.id,
        amount,
        type: 'debit',
        category: 'transfer',
        description: `Transfer to ${recipient.account_number}`,
        reference: uuidv4(),
        group_reference: groupRef,
        status: 'success',
      },
      {
        sender_account_id: sender.id,
        receiver_account_id: recipient.id,
        amount,
        type: 'credit',
        category: 'transfer',
        description: `Received from ${sender.account_number}`,
        reference: uuidv4(),
        group_reference: groupRef,
        status: 'success',
      },
    ])

    await trx.commit()

    return {
      message: 'Transfer successful',
      groupRef,
      transaction_time: now,
      reference: sender.reference,
      recipient: {
        account_number: recipient.account_number,
        amount_received: amount,
        recipient_name: account_name,
      },
    }
  } catch (err) {
    await trx.rollback()
    throw err
  }
}

// Withdraw funds to bank
export const withdrawFunds = async ({
  account_number,
  userId,
  amount,
  transaction_pin,
  bank_name,
}: WithdrawFundsDTO) => {
  const trx = await db.transaction()

  try {
    const account = await trx('accounts').where({ id: userId }).first()
    if (!account) throw new Error('Account not found')

    const recipientAccount = await trx('accounts')
      .where({ account_number })
      .first()

    const isInternalTransfer = !!recipientAccount

    const transactionDescription = isInternalTransfer
      ? `Transfer to ${account_number}`
      : `Withdrawal to external account ${bank_name}`

    const isValidPin = await confirmAccountPin(userId, transaction_pin)
    if (!isValidPin) throw new Error('Invalid transaction pin')

    if (parseFloat(account.balance) < amount) {
      throw new Error('Insufficient balance')
    }

    // Deduct from sender
    await trx('accounts').where({ id: account.id }).decrement('balance', amount)

    // Credit recipient if internal
    if (isInternalTransfer) {
      await trx('accounts')
        .where({ id: recipientAccount.id })
        .increment('balance', amount)
    }

    const [transaction] = await trx('transactions')
      .insert({
        sender_account_id: account.id,
        receiver_account_id: isInternalTransfer ? recipientAccount?.id : null,
        amount,
        type: 'debit',
        category: 'withdrawal',
        reference: uuidv4(),
        status: 'success',
        channel: 'wallet',
        description: transactionDescription,
      })
      .returning('*')

    await trx.commit()

    return {
      success: true,
      reference: transaction.reference,
      amount,
      recipient_account: account_number,
      timestamp: new Date(),
    }
  } catch (err) {
    await trx.rollback()
    console.error('Withdrawal failed:', err)
    throw err
  }
}

export const transactionById = async (
  transactionId: number,
  accountId: number
) => {
  const trx = await db.transaction()
  try {
    const transaction = await db('transactions')
      .where({ id: transactionId })
      .andWhere(function () {
        // Only return the transaction if the account is either sender (for debits) OR receiver (for credits)
        this.where(function () {
          this.where('type', 'debit').andWhere('sender_account_id', accountId)
        }).orWhere(function () {
          this.where('type', 'credit').andWhere(
            'receiver_account_id',
            accountId
          )
        })
      })
      .first()

    const recipient = await trx('accounts')
      .where({ user_id: transaction.receiver_account_id })
      .first()
    console.log(recipient.id)
    const [user] = await trx('users')
      .where({ id: recipient.user_id })
      .select('first_name', 'last_name')
    if (!user) throw new Error('User not found')

    const account_name = `${user.first_name} ${user.last_name}`

    return { Transaction: transaction, account_name }
  } catch (error: any) {
    console.error('[Transaction By ID Error]', error.message)
    await trx.rollback()
    throw new Error('Transaction not found')
  }
}

export const allTransactions = async (accountId: number) => {
  const transactions = await db('transactions')
    .where(function () {
      this.where('sender_account_id', accountId).andWhere('type', 'debit')
    })
    .orWhere(function () {
      this.where('receiver_account_id', accountId).andWhere('type', 'credit')
    })
    .orderBy('created_at', 'desc')

  return transactions
}
