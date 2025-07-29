import { channel } from 'diagnostics_channel'
import db from '../config/db'
import {
  FundWalletDTO,
  TransferFundsDTO,
  WithdrawFundsDTO,
  TransactionContext,
} from '../dtos/transactionDto'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'process'
import { confirmAccountPin } from './accountServices'

// Fund a user wallet
export const fundWallet = async ({
  account_number,
  amount,
  source = 'bank',
}: FundWalletDTO) => {
  const trx = await db.transaction()

  try {
    await trx('accounts').where({ account_number }).increment('balance', amount)

    const [account] = await trx('accounts').where({ account_number })
    if (!account) throw new Error('Account not found')

    const reference = uuidv4()
    const description = `Wallet funded via ${source}`

    const [transactionId] = await trx('transactions').insert({
      reference,
      sender_account_id: account.id,
      type: 'funding',
      amount,
      status: 'success',
      description,
      channel: source,
    })

    const [transaction] = await trx('transactions').where({ id: transactionId })

    await trx.commit()

    return {
      amount,
      account_number,
      balance: account.balance,
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

    if (!sender || !recipient) throw new Error('Invalid account details')

    if (!sender.transaction_pin)
      throw new Error('Transaction pin not set for this account')

    const isValidPin = await confirmAccountPin(sender.user_id, transaction_pin)

    if (!isValidPin) throw new Error('Invalid transaction pin')

    if (parseFloat(sender.balance) < amount)
      throw new Error('Insufficient balance')

    await trx('accounts').where({ id: sender.id }).decrement('balance', amount)
    await trx('accounts')
      .where({ id: recipient.id })
      .increment('balance', amount)

    const now = new Date()
    const reference = uuidv4()

    // Log transactions
    await trx('transactions').insert([
      {
        reference,
        account_id: sender.id,
        type: 'debit',
        amount,
        status: 'success',
        description: `Transfer to ${recipient.account_number}`,
        created_at: now,
        updated_at: now,
      },
      {
        reference,
        account_id: recipient.id,
        type: 'credit',
        amount,
        status: 'success',
        description: `Received from ${sender.account_number}`,
        created_at: now,
        updated_at: now,
      },
    ])

    await trx.commit()

    return {
      message: 'Transfer successful',
      reference,
      transaction_time: now,
      recipient: {
        account_number: recipient.account_number,
        amount_received: amount,
        recipient_name: recipient.first_name + ' ' + recipient.last_name,
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
  amount,
  bank_account,
}: WithdrawFundsDTO) => {
  const trx = await db.transaction()

  try {
    const [account] = await trx('accounts').where({ account_number }).first()

    if (!account) throw new Error('Account not found')

    if (parseFloat(account.balance) < amount)
      throw new Error('Insufficient balance')

    await trx('accounts').where({ id: account.id }).decrement('balance', amount)

    await trx('transactions').insert({
      id: uuidv4(),
      account_id: account.id,
      type: 'debit',
      amount,
      status: 'success',
      description: `Withdrawal to bank account ${bank_account}`,
      created_at: new Date(),
      updated_at: new Date(),
    })

    await trx.commit()
    return account
  } catch (err) {
    await trx.rollback()
    throw err
  }
}
