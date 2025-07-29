import db from '../config/db'
import {
  FundWalletDTO,
  TransferFundsDTO,
  WithdrawFundsDTO,
  TransactionContext,
} from '../dtos/transactionDto'
import { v4 as uuidv4 } from 'uuid'

// Fund a user wallet
export const fundWallet = async ({
  account_number,
  amount,
  source = 'bank',
}: FundWalletDTO) => {
  const trx = await db.transaction()

  try {
    await trx('accounts')
      .where({ account_number })
      .increment('balance', amount)
      .returning('*')

    const [account] = await trx('accounts').where({ account_number })
    if (!account) throw new Error('Account not found')

    await trx('transactions').insert({
      id: uuidv4(),
      account_id: account.id,
      type: 'credit',
      amount,
      status: 'success',
      description: `Wallet funded via ${source}`,
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

// Transfer funds between wallets
export const transferFunds = async ({
  sender_account,
  recipient_account,
  amount,
}: TransferFundsDTO) => {
  const trx = await db.transaction()

  try {
    const [sender] = await trx('accounts')
      .where({ account_number: sender_account })
      .first()

    const [recipient] = await trx('accounts')
      .where({ account_number: recipient_account })
      .first()

    if (!sender || !recipient) throw new Error('Invalid account details')

    if (parseFloat(sender.balance) < amount)
      throw new Error('Insufficient balance')

    await trx('accounts').where({ id: sender.id }).decrement('balance', amount)

    await trx('accounts')
      .where({ id: recipient.id })
      .increment('balance', amount)

    const now = new Date()

    await trx('transactions').insert([
      {
        id: uuidv4(),
        account_id: sender.id,
        type: 'debit',
        amount,
        status: 'success',
        description: `Transfer to ${recipient.account_number}`,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
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
    return { sender, recipient }
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
