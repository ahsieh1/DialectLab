import { Kysely, sql } from 'kysely'
import { Database } from '../database'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('session_participants')
    .ifNotExists()
    .addColumn('session_id', 'integer', (col) => col.notNull().references('practice_sessions.id').onDelete('cascade'))
    .addColumn('user_id', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('joined_at', 'timestamp', (col) => col.defaultTo(db.fn('now')).notNull())
    .addColumn('left_at', 'timestamp')
    .addPrimaryKeyConstraint('session_participants_pkey', ['session_id', 'user_id'])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('session_participants').ifExists().execute()
}