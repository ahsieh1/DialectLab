import { Kysely, sql } from 'kysely'
import { Database } from '../database'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('chat_messages')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('room_id', 'integer', (col) => col.notNull().references('discussion_rooms.id'))
    .addColumn('sender_id', 'integer', (col) => col.notNull().references('users.id'))
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('sent_at', 'timestamp', (col) => col.defaultTo(db.fn('now')).notNull())
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('chat_messages').ifExists().execute()
}