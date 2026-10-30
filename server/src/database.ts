import { Pool } from 'pg'
import { Kysely, PostgresDialect, Generated, ColumnType } from 'kysely'
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
    users: UserTable
}

export interface UserTable {
    id: Generated<number>;

    username: string;
    email: string;
    pass_hash: string;

    created_at: ColumnType<Date, string | undefined, never>;
    last_active_at: ColumnType<Date, string | undefined, string>;
}
export const db = new Kysely<Database>({
  dialect,
})