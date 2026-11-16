import { Kysely, sql } from 'kysely'
import { Database } from '../database'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('user_languages')
    .ifNotExists()
    .addColumn('user_id', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('language_id', 'integer', (col) => col.notNull().references('languages.id').onDelete('cascade'))
    .addColumn('proficiency_level', 'varchar(20)', (col) => 
        col.check(sql`proficiency_level in ('beginner', 'intermediate', 'advanced', 'master', 'native')`))
    .addColumn('role', 'varchar(20)', (col) => col.notNull().check(sql`role in ('learner', 'teacher')`))
    .addPrimaryKeyConstraint('user_languages_pkey', ['user_id', 'language_id'])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('user_languages').ifExists().execute()
}