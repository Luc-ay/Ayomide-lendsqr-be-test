import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoute'
import transactionRoutes from './routes/transactionRoute'
import { errorHandler } from './middleware/errorHandler'

// Load .env file
dotenv.config()

const app = express()

// Middleware
app.use(express.json())

// Routes
app.use('/', userRoutes)
app.use('/transaction', transactionRoutes)

app.use(errorHandler)
const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
