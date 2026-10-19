import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import * as dotenv from 'dotenv'

dotenv.config()

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  })
})

// Database interface for types (we will expand this later)
export interface Database {
  // Empty for now until we add tables
}

export const db = new Kysely<Database>({
  dialect,
})