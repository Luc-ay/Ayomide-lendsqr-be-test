import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { User } from 'src/dtos/userDto'
import { checkBlacklist } from 'src/utils/karmaLookup'
import { createUser, findUserByEmail } from '../../services/userService'
import { registerUser } from '../userController'

// src/controllers/user.controller.test.ts

// src/controllers/user.controller.test.ts
// Mock checkBlacklist from src/utils/karmaLookup
jest.mock('src/utils/karmaLookup', () => {
  const actual = jest.requireActual('src/utils/karmaLookup')
  return {
    ...actual,
    checkBlacklist: jest.fn(),
    __esModule: true,
  }
})

// Mock findUserByEmail and createUser from ../services/userService
jest.mock('../../services/userService', () => {
  const actual = jest.requireActual('../../services/userService')
  return {
    ...actual,
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    __esModule: true,
  }
})

// Mock bcrypt.hash
jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'),
  hash: jest.fn(),
  __esModule: true,
}))
describe('registerUser() registerUser method', () => {
  // Helper to create mock Request and Response
  const getMockReqRes = (body: Partial<User> = {}) => {
    const req = {
      body,
    } as Request

    const resJson = jest.fn()
    const resStatus = jest.fn(() => ({ json: resJson }))
    const res = {
      status: resStatus,
    } as unknown as Response

    return { req, res, resStatus, resJson }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // =========================
  // Happy Path Tests
  // =========================

  it('should register a user successfully when all fields are valid and user is not blacklisted or existing', async () => {
    // This test ensures a user is registered when all conditions are met.
    const userInput = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '1234567890',
      password: 'password123',
    }

    const { req, res, resStatus, resJson } = getMockReqRes(userInput)

    // Mock checkBlacklist to return not blacklisted
    ;(
      checkBlacklist as jest.MockedFunction<typeof checkBlacklist>
    ).mockResolvedValue({
      blacklisted: false,
    })

    // Mock findUserByEmail to return undefined (user does not exist)
    ;(
      findUserByEmail as jest.MockedFunction<typeof findUserByEmail>
    ).mockResolvedValue(undefined)

    // Mock bcrypt.hash to return a hashed password
    ;(bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(
      'hashedPassword'
    )

    // Mock createUser to return a new user object
    const createdUser: User = {
      id: 1,
      username: 'john',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '1234567890',
      password: 'hashedPassword',
      email_verified: false,
      verified: false,
      blacklisted: false,
    }
    ;(createUser as jest.MockedFunction<typeof createUser>).mockResolvedValue(
      createdUser
    )

    await registerUser(req, res)

    expect(checkBlacklist).toHaveBeenCalledWith(
      'john@example.com',
      '1234567890'
    )
    expect(findUserByEmail).toHaveBeenCalledWith('john@example.com')
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
    expect(createUser).toHaveBeenCalledWith({
      username: 'john',
      email: 'john@example.com',
      phone_number: '1234567890',
      password: 'hashedPassword',
      first_name: 'John',
      last_name: 'Doe',
      email_verified: false,
      verified: false,
      blacklisted: false,
    })
    expect(resStatus).toHaveBeenCalledWith(201)
    expect(resJson).toHaveBeenCalledWith({
      message: 'User registered successfully',
      user: {
        id: 1,
        username: 'john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        email_verified: false,
        verified: false,
        blacklisted: false,
      },
    })
  })

  it('should register a user with mixed-case email and ensure email is lowercased', async () => {
    // This test ensures that emails are lowercased before processing.
    const userInput = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'Jane.Smith@Example.COM',
      phone_number: '5551234567',
      password: 'securePass!',
    }

    const { req, res, resStatus, resJson } = getMockReqRes(userInput)

    ;(
      checkBlacklist as jest.MockedFunction<typeof checkBlacklist>
    ).mockResolvedValue({
      blacklisted: false,
    })
    ;(
      findUserByEmail as jest.MockedFunction<typeof findUserByEmail>
    ).mockResolvedValue(undefined)
    ;(bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(
      'hashedJane'
    )
    const createdUser: User = {
      id: 2,
      username: 'jane.smith',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone_number: '5551234567',
      password: 'hashedJane',
      email_verified: false,
      verified: false,
      blacklisted: false,
    }
    ;(createUser as jest.MockedFunction<typeof createUser>).mockResolvedValue(
      createdUser
    )

    await registerUser(req, res)

    expect(findUserByEmail).toHaveBeenCalledWith('jane.smith@example.com')
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane.smith@example.com',
        username: 'jane.smith',
      })
    )
    expect(resStatus).toHaveBeenCalledWith(201)
    expect(resJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User registered successfully',
        user: expect.objectContaining({
          email: 'jane.smith@example.com',
        }),
      })
    )
  })

  // =========================
  // Edge Case Tests
  // =========================

  it('should return 400 if any required field is missing', async () => {
    // This test checks that missing fields result in a 400 error.
    const requiredFields = [
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'password',
    ]
    for (const field of requiredFields) {
      const userInput: any = {
        first_name: 'A',
        last_name: 'B',
        email: 'a@b.com',
        phone_number: '123',
        password: 'pw',
      }
      delete userInput[field]

      const { req, res, resStatus, resJson } = getMockReqRes(userInput)

      await registerUser(req, res)

      expect(resStatus).toHaveBeenCalledWith(400)
      expect(resJson).toHaveBeenCalledWith({
        message: 'All fields are required',
      })
    }
  })

  it('should return 403 if user is blacklisted (with reason)', async () => {
    // This test checks that blacklisted users are denied registration with a reason.
    const userInput = {
      first_name: 'Evil',
      last_name: 'User',
      email: 'evil@bad.com',
      phone_number: '6666666666',
      password: 'badpass',
    }

    const { req, res, resStatus, resJson } = getMockReqRes(userInput)

    ;(
      checkBlacklist as jest.MockedFunction<typeof checkBlacklist>
    ).mockResolvedValue({
      blacklisted: true,
      reason: 'Fraud detected',
    })

    await registerUser(req, res)

    expect(resStatus).toHaveBeenCalledWith(403)
    expect(resJson).toHaveBeenCalledWith({
      message:
        'Registration denied: You are listed on the financial blacklist.',
      reason: 'Fraud detected',
    })
  })

  it('should return 403 if user is blacklisted (without reason)', async () => {
    // This test checks that blacklisted users are denied registration with a default reason if none is provided.
    const userInput = {
      first_name: 'Evil',
      last_name: 'User',
      email: 'evil@bad.com',
      phone_number: '6666666666',
      password: 'badpass',
    }

    const { req, res, resStatus, resJson } = getMockReqRes(userInput)

    ;(
      checkBlacklist as jest.MockedFunction<typeof checkBlacklist>
    ).mockResolvedValue({
      blacklisted: true,
    })

    await registerUser(req, res)

    expect(resStatus).toHaveBeenCalledWith(403)
    expect(resJson).toHaveBeenCalledWith({
      message:
        'Registration denied: You are listed on the financial blacklist.',
      reason: 'Flagged by Adjutor API',
    })
  })

  it('should return 409 if email is already registered', async () => {
    // This test checks that duplicate emails are not allowed.
    const userInput = {
      first_name: 'Sam',
      last_name: 'Existing',
      email: 'sam@exists.com',
      phone_number: '1112223333',
      password: 'password',
    }

    const { req, res, resStatus, resJson } = getMockReqRes(userInput)

    ;(
      checkBlacklist as jest.MockedFunction<typeof checkBlacklist>
    ).mockResolvedValue({
      blacklisted: false,
    })
    ;(
      findUserByEmail as jest.MockedFunction<typeof findUserByEmail>
    ).mockResolvedValue({
      id: 99,
      username: 'sam',
      first_name: 'Sam',
      last_name: 'Existing',
      email: 'sam@exists.com',
      phone_number: '1112223333',
      password: 'hashed',
      email_verified: false,
      verified: false,
      blacklisted: false,
    })

    await registerUser(req, res)

    expect(resStatus).toHaveBeenCalledWith(409)
    expect(resJson).toHaveBeenCalledWith({
      message: 'Email is already registered',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    // This test checks that unexpected errors are handled gracefully.
    const userInput = {
      first_name: 'Crash',
      last_name: 'Test',
      email: 'crash@test.com',
      phone_number: '9998887777',
      password: 'crashpass',
    }

    const { req, res, resStatus, resJson } = getMockReqRes(userInput)

    ;(
      checkBlacklist as jest.MockedFunction<typeof checkBlacklist>
    ).mockResolvedValue({
      blacklisted: false,
    })
    ;(
      findUserByEmail as jest.MockedFunction<typeof findUserByEmail>
    ).mockResolvedValue(undefined)
    ;(bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockRejectedValue(
      new Error('Hash failed')
    )

    await registerUser(req, res)

    expect(resStatus).toHaveBeenCalledWith(500)
    expect(resJson).toHaveBeenCalledWith({ message: 'Internal server error' })
  })

  it('should handle createUser throwing an error and return 500', async () => {
    // This test checks that errors from createUser are handled and return 500.
    const userInput = {
      first_name: 'Error',
      last_name: 'User',
      email: 'error@user.com',
      phone_number: '1231231234',
      password: 'errorpass',
    }

    const { req, res, resStatus, resJson } = getMockReqRes(userInput)

    ;(
      checkBlacklist as jest.MockedFunction<typeof checkBlacklist>
    ).mockResolvedValue({
      blacklisted: false,
    })
    ;(
      findUserByEmail as jest.MockedFunction<typeof findUserByEmail>
    ).mockResolvedValue(undefined)
    ;(bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue(
      'hashedError'
    )
    ;(createUser as jest.MockedFunction<typeof createUser>).mockRejectedValue(
      new Error('DB error')
    )

    await registerUser(req, res)

    expect(resStatus).toHaveBeenCalledWith(500)
    expect(resJson).toHaveBeenCalledWith({ message: 'Internal server error' })
  })
})
