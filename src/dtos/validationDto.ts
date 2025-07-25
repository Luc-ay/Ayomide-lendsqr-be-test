export interface User {
  id?: number
  name: string
  email: string
  password: string
  created_at?: Date
  updated_at?: Date
}

export interface CreateUserProfileInput {
  user_id: number
  address?: string
  phone?: string
  dob?: string
  nin?: string
  profile_pic?: string
}

export interface CreateAccountInput {
  user_id: number
  account_number: string
  account_type?: string
  balance?: number
}

export interface CreateTransactionInput {
  sender_id: number
  receiver_id: number
  amount: number
  type: 'transfer' | 'withdrawal' | 'fund'
  status?: 'pending' | 'completed' | 'failed'
  reference?: string
  description?: string
}
