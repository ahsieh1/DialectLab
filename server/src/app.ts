import express, { Express } from 'express'
import cors from 'cors'
import { Kysely } from 'kysely'
import { Database, db } from './database'
import { createUserRouter } from './routes/userRoutes'

/**
 * Create the configured Express application instance.
 */
export function createApp(database: Kysely<Database> = db): Express {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Mount the user API routes
  app.use('/api/users', createUserRouter(database))

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      application: 'DialectLab',
    })
  })

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return app
}

const app = createApp()

export default app
