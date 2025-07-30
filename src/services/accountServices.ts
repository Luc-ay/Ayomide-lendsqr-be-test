import db from 'src/config/db'
import bcrypt from 'bcryptjs'
import { CreateAccountInput } from 'src/dtos/transactionDto'

export const createAccount = async (input: CreateAccountInput) => {
  try {
    const [createdAccount] = await db('accounts').insert({
      user_id: input.user_id,
      account_number: input.account_number,
      account_type: input.account_type || 'wallet',
      balance: input.balance || 0,
    })

    return createdAccount
  } catch (error) {
    console.error('Error creating account:', error)
    throw new Error('Could not create account')
  }
}
export const findAccount = async (
  account_number: string
): Promise<CreateAccountInput | undefined> => {
  const query = db<CreateAccountInput>('accounts')

  return db<CreateAccountInput>('accounts').where({ account_number }).first()
}

export const findAccountByUserId = async (
  userId: number
): Promise<CreateAccountInput | undefined> => {
  return db<CreateAccountInput>('accounts').where({ user_id: userId }).first()
}

export const createAccountPin = async (userId: number, pin: string) => {
  const account = await db('accounts').where({ user_id: userId }).first()
  if (!account) throw new Error('Account not found')

  if (account.account_pin) throw new Error('PIN already exists')

  const hashedPin = await bcrypt.hash(pin, 10)

  await db('accounts').where({ user_id: userId }).update({
    account_pin: hashedPin,
    updated_at: new Date(),
  })

  return { message: 'PIN created successfully' }
}

export const confirmAccountPin = async (userId: number, inputPin: string) => {
  const account = await db('accounts').where({ user_id: userId }).first()
  if (!account || !account.account_pin)
    throw new Error('PIN not set --- Set a PIN first')

  const match = await bcrypt.compare(inputPin, account.account_pin)
  if (!match) throw new Error('Invalid PIN')

  return true
}
