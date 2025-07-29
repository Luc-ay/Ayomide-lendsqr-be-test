import { createClient } from 'redis'
import dotenv from 'dotenv'
dotenv.config()

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient
  .connect()
  .then(() => console.log('Connected to Redis Cloud'))
  .catch((err) => console.error('Redis Connection Failed:', err))

export default redisClient
