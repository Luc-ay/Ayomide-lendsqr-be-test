export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
  profile_pic?: string
  dob?: string
  bvn?: string
  gender?: string
  marital_status?: string
  occupation?: string
  employment_status?: string
  address?: string
  apartment_type?: string
  nearest_landmark?: string
  city?: string
  state?: string
  lga?: string
  email_verified: boolean
  verified: boolean
  verified_on?: string
  last_login_date?: string
  blacklisted: boolean
}
