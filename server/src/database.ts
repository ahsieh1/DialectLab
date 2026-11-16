
import { Pool } from 'pg'
import {
  Kysely,
  PostgresDialect,
  Generated,
  ColumnType,
} from 'kysely'
import * as dotenv from 'dotenv'

dotenv.config()

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
})

export interface UserTable {
  id: Generated<number>
  username: string
  email: string
  pass_hash: string
  created_at: ColumnType<Date, string | undefined, never>
  last_active_at: ColumnType<Date, string | undefined, string>
}

export interface ChatroomTable {
  id: Generated<number>
  language_code: string
  channel_id: string
  created_at: ColumnType<Date, string | undefined, never>
}

export interface MessageTable {
  id: Generated<number>
  room_id: number
  user_id: number
  content: string
  created_at: ColumnType<Date, string | undefined, never>
}

export interface Database {
  users: UserTable
  chatrooms: ChatroomTable
  messages: MessageTable
}

export const db = new Kysely<Database>({
  dialect,
})
