import express from 'express'
import dotenv from 'dotenv'
import db from './config/db'
import limiter from './dtos/ratelimit'
import userRoutes from './routes/userRoute'
import { errorHandler } from './middleware/errorHandler'

// Load .env file
dotenv.config()

// Initializes Express app
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())
app.use(limiter)

app.use('/auth', userRoutes)

app.use(errorHandler)
const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
