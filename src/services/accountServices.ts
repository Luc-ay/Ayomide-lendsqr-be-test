import db from 'src/config/db'
import { CreateAccountInput } from 'src/dtos/validationDto'

export const createAccount = async (input: CreateAccountInput) => {
  const [createdAccount] = await db('accounts')
    .insert({
      user_id: input.user_id,
      account_number: input.account_number,
      account_type: input.account_type || 'wallet',
      balance: input.balance || 0,
    })
    .returning('*') // This works for PostgreSQL
  return createdAccount
}
export const findAccount = async (
  account_number?: string,
  userId?: number
): Promise<CreateAccountInput | undefined> => {
  const query = db<CreateAccountInput>('accounts')

  if (account_number) {
    query.where({ account_number })
  }

  if (userId) {
    query.andWhere({ user_id: userId })
  }

  return query.first()
}
