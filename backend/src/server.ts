import cors from 'cors'
import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import { authLimiter, firSubmissionLimiter, generalLimiter } from './middleware/rateLimit'
import { sanitizeInput } from './middleware/sanitize'
import authRoutes from './routes/auth'
import blockchainRoutes from './routes/blockchain'
import firRoutes from './routes/fir'
import { logger, requestLogger } from './services/logger'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
    scriptSrc: ["'self'"],
    fontSrc: ["'self'", "https:", "http:"],
    imgSrc: ["'self'", "data:", "https:", "http:"],
  },
}))

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5001',
  process.env.CORS_ORIGIN || 'http://localhost:3000',
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use('/api/auth', authLimiter)
app.use('/api/firs', generalLimiter)

app.use((req, res, next) => {
  res.setHeader('X-RateLimit-Limit', '100')
  res.setHeader('X-RateLimit-Remaining', '99')
  res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 900)
  next()
})

app.use(requestLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(sanitizeInput)

app.use('/api/auth', authRoutes)
app.use('/api/firs', firRoutes)
app.use('/api/blockchain', blockchainRoutes)

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'e-FIRChain Backend API',
    version: '1.0.0',
    status: 'running',
  })
})

app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  })
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  })
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})