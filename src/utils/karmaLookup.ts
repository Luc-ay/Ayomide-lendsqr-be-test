import axios from 'axios'

const ADJUTOR_BASE_URL = process.env.ADJUTOR_BASE_URL
const API_KEY = process.env.KARMA_API

export const checkBlacklist = async (identity: string) => {
  try {
    const url = `${ADJUTOR_BASE_URL}/verification/karma/${encodeURIComponent(
      identity
    )}`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const { status, message } = response.data

    if (status === 'success' && message === 'Successful') {
      // Allow user to continue
      return { blacklisted: false }
    }

    // Otherwise, treat as blacklisted
    return {
      blacklisted: true,
      reason: 'Match found in blacklist records',
    }
  } catch (error: any) {
    console.error(
      '[Adjutor Blacklist Error]',
      error?.response?.data || error.message
    )
    return { blacklisted: false }
  }
}
