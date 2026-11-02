import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Mount the user API routes
app.use('/api/users', userRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const port = Number(process.env.PORT) || 3000

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})