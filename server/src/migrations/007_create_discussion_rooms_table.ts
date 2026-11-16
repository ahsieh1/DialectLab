import { Kysely, sql } from 'kysely'
import { Database } from '../database'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('discussion_rooms')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('community_id', 'integer', (col) => col.notNull().references('communities.id'))
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('topic_id', 'integer', (col) => col.references('topics.id'))

    .addColumn('room_type', 'varchar(20)', (col) =>
        col.notNull().check(sql`room_type in ('text', 'voice')`))
    // Note: Will not be necessary if voice-based chats aren't implemented.

    .addColumn('required_proficiency', 'varchar(20)', (col) => 
        col.check(sql`required_proficiency in ('beginner', 'intermediate', 'advanced', 'master', 'native')`))
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('discussion_rooms').ifExists().execute()
}