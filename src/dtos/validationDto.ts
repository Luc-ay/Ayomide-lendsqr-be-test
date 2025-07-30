import Joi from 'joi'

export const registerUserSchema = Joi.object({
  first_name: Joi.string().required().messages({
    'string.base': 'First name must be a string',
    'any.required': 'First name is required',
  }),
  last_name: Joi.string().required().messages({
    'string.base': 'Last name must be a string',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  phone_number: Joi.string()
    .pattern(/^[0-9]{11}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 11 digits',
      'any.required': 'Phone number is required',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
})

export const editUserProfileSchema = Joi.object({
  username: Joi.string().optional(),
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  bvn: Joi.string().length(11).optional(),
  dob: Joi.date().iso().optional(),
  profile_pic: Joi.string().uri().optional(),
  address: Joi.string().optional(),
  apartment_type: Joi.string().optional(),
  nearest_landmark: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  lga: Joi.string().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  marital_status: Joi.string()
    .valid('single', 'married', 'divorced', 'widowed')
    .optional(),
  occupation: Joi.string().optional(),
  employment_status: Joi.string()
    .valid('employed', 'unemployed', 'student', 'retired')
    .optional(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export const fundWalletSchema = Joi.object({
  account_number: Joi.string().required(),
  amount: Joi.number().positive().required(),
  source: Joi.string().optional().default('bank'),
})

export const transferFundsSchema = Joi.object({
  recipient_account: Joi.string().required(),
  amount: Joi.number().positive().required(),
  transaction_pin: Joi.string().length(4).required(),
})

export const withdrawFundsSchema = Joi.object({
  account_number: Joi.string().required(),
  amount: Joi.number().positive().required(),
  bank_name: Joi.string().required(),
  transaction_pin: Joi.string().length(4).required(),
})

export const createAccountPinSchema = Joi.object({
  pin: Joi.string().length(4).pattern(/^\d+$/).required().messages({
    'string.base': 'PIN must be a string',
    'string.length': 'PIN must be exactly 4 digits',
    'string.pattern.base': 'PIN must contain only numbers',
    'any.required': 'PIN is required',
  }),
})
