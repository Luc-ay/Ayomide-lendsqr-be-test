export interface FundWalletDTO {
  account_number: string
  amount: number
  source?: string // optional, default: 'bank'
}

export interface TransferFundsDTO {
  sender_account: string
  recipient_account: string
  amount: number
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
