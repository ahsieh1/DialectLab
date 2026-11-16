
import { Kysely } from 'kysely'

interface MigrationDatabase {
  messages: {
    id: number
    room_id: number
    user_id: number
    content: string
    created_at: Date
  }
}

export async function up(db: Kysely<MigrationDatabase>): Promise<void> {
  await db.schema
    .createTable('messages')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('room_id', 'integer', (col) =>
      col.notNull().references('chatrooms.id').onDelete('cascade')
    )
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(db.fn('now')).notNull()
    )
    .execute()

  await db.schema
    .createIndex('messages_room_created_idx')
    .on('messages')
    .columns(['room_id', 'created_at'])
    .execute()
}

export async function down(db: Kysely<MigrationDatabase>): Promise<void> {
  await db.schema
    .dropTable('messages')
    .ifExists()
    .execute()
}
