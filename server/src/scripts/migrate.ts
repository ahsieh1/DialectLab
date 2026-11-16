
import * as path from 'path'
import { promises as fs } from 'fs'
import { Kysely, PostgresDialect } from 'kysely'
import { Migrator, FileMigrationProvider } from 'kysely/migration'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import {
  Migrator,
  FileMigrationProvider,
} from 'kysely/migration'
import * as dotenv from 'dotenv'

dotenv.config()

async function migrateToLatest() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const db = new Kysely<any>({
    dialect: new PostgresDialect({ pool }),
  })

  try {
    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, '../migrations'),
      }),
    })

    const { error, results } = await migrator.migrateToLatest()

    results?.forEach((result) => {
      console.log(
        `Migration "${result.migrationName}": ${result.status}`
      )
    })

    if (error) {
      throw error
    }

    console.log('Database migrations completed successfully.')
  } finally {
    await db.destroy()
  }
}

migrateToLatest().catch((error) => {
  console.error('Migration failed:')
  console.error(error)
  process.exitCode = 1
})
