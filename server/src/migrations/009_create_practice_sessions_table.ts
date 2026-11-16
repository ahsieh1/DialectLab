import { Kysely, sql } from 'kysely'
import { Database } from '../database'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('practice_sessions')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('room_id', 'integer', (col) => col.notNull().references('discussion_rooms.id'))
    .addColumn('host_id', 'integer', (col) => col.notNull().references('users.id'))
    .addColumn('title', 'varchar(100)', (col) => col.notNull())
    .addColumn('topic_id', 'integer', (col) => col.references('topics.id'))
    .addColumn('target_proficiency', 'varchar(20)', (col) => 
        col.check(sql`target_proficiency in ('beginner', 'intermediate', 'advanced', 'master', 'native')`))
    .addColumn('started_at', 'timestamp', (col) => col.defaultTo(db.fn('now')).notNull())
    .addColumn('ended_at', 'timestamp')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('practice_sessions').ifExists().execute()
}