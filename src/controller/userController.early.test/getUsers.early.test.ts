import { Request, Response } from 'express'
import { getAllUsers } from '../../services/userService'
import { getUsers } from '../userController'

// src/controllers/user.controller.test.ts

// src/controllers/user.controller.test.ts
// Mock only the specified functions in ../services/userService
jest.mock('../../services/userService', () => {
  const actual = jest.requireActual('../../services/userService')
  return {
    ...actual,
    checkPhoneNumber: jest.fn(),
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    getAllUsers: jest.fn(),
    loginUser: jest.fn(),
    logoutService: jest.fn(),
    updateUserProfile: jest.fn(),
    __esModule: true,
  }
})

// Mock only the specified functions in src/utils/karmaLookup
jest.mock('src/utils/karmaLookup', () => {
  const actual = jest.requireActual('src/utils/karmaLookup')
  return {
    ...actual,
    checkBlacklist: jest.fn(),
    __esModule: true,
  }
})

// Mock only the specified functions in src/services/accountServices
jest.mock('src/services/accountServices', () => {
  const actual = jest.requireActual('src/services/accountServices')
  return {
    ...actual,
    createAccount: jest.fn(),
    findAccount: jest.fn(),
    findAccountByUserId: jest.fn(),
    __esModule: true,
  }
})

describe('getUsers() getUsers method', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  // Happy Paths
  describe('Happy paths', () => {
    it('should return 200 and a list of users when users exist', async () => {
      // This test ensures that when users are present, the function returns them with a 200 status.
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone_number: '1234567890',
          password: 'hashedpassword',
          email_verified: true,
          verified: true,
          blacklisted: false,
        },
        {
          id: 2,
          username: 'user2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone_number: '0987654321',
          password: 'hashedpassword2',
          email_verified: false,
          verified: false,
          blacklisted: false,
        },
      ]
      jest.mocked(getAllUsers).mockResolvedValueOnce(mockUsers as any)

      const req = {} as Request
      const json = jest.fn()
      const status = jest.fn(() => ({ json }))
      const res = { status } as unknown as Response

      await getUsers(req, res)

      expect(getAllUsers).toHaveBeenCalledTimes(1)
      expect(status).toHaveBeenCalledWith(200)
      expect(json).toHaveBeenCalledWith(mockUsers)
    })
  })

  // Edge Cases
  describe('Edge cases', () => {
    it('should return 404 and message when getAllUsers returns an empty array', async () => {
      // This test ensures that when no users are found (empty array), a 404 is returned.
      jest.mocked(getAllUsers).mockResolvedValueOnce([])

      const req = {} as Request
      const json = jest.fn()
      const status = jest.fn(() => ({ json }))
      const res = { status } as unknown as Response

      await getUsers(req, res)

      expect(getAllUsers).toHaveBeenCalledTimes(1)
      expect(status).toHaveBeenCalledWith(404)
      expect(json).toHaveBeenCalledWith({ message: 'No users found' })
    })

    it('should return 404 and message when getAllUsers returns undefined', async () => {
      // This test ensures that if getAllUsers returns undefined, a 404 is returned.
      jest.mocked(getAllUsers).mockResolvedValueOnce(undefined as any)

      const req = {} as Request
      const json = jest.fn()
      const status = jest.fn(() => ({ json }))
      const res = { status } as unknown as Response

      await getUsers(req, res)

      expect(getAllUsers).toHaveBeenCalledTimes(1)
      expect(status).toHaveBeenCalledWith(404)
      expect(json).toHaveBeenCalledWith({ message: 'No users found' })
    })
  })
})
