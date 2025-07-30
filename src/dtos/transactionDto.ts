export interface FundWalletDTO {
  account_number: string
  amount: number
  source?: string // optional, default: 'bank'
}

export interface TransferFundsDTO {
  sender_account: string
  recipient_account: string
  amount: number
  transaction_pin: string
}

export interface WithdrawFundsDTO {
  account_number: string
  amount: number
  bank_account: string
}

export interface TransactionContext {
  senderAccount?: string
  recipientAccount?: string
  bankAccount?: string
  cycle?: string
}

export interface CreateAccountInput {
  id: number
  user_id: number
  account_number: string
  account_type?: string
  balance?: number
}
