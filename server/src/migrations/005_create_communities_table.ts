import { Kysely, sql } from 'kysely'
import { Database } from '../database'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('communities')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('language_id', 'integer', (col) => col.notNull().references('languages.id'))
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(db.fn('now')).notNull())
    .addColumn('target_proficiency', 'varchar(20)', (col) => 
        col.check(sql`target_proficiency in ('beginner', 'intermediate', 'advanced', 'master', 'native')`))
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('communities').ifExists().execute()
}