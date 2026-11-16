
import { Kysely } from 'kysely'

interface MigrationDatabase {
  chatrooms: {
    id: number
    language_code: string
    channel_id: string
    created_at: Date
  }
}

export async function up(db: Kysely<MigrationDatabase>): Promise<void> {
  await db.schema
    .createTable('chatrooms')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('language_code', 'varchar(10)', (col) => col.notNull())
    .addColumn('channel_id', 'varchar(50)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(db.fn('now')).notNull()
    )
    .addUniqueConstraint(
      'chatrooms_language_channel_unique',
      ['language_code', 'channel_id']
    )
    .execute()
}

export async function down(db: Kysely<MigrationDatabase>): Promise<void> {
  await db.schema
    .dropTable('chatrooms')
    .ifExists()
    .execute()
}
