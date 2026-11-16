import { Kysely, sql } from 'kysely'
import { Database } from '../database'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('community_memberships')
    .ifNotExists()
    .addColumn('community_id', 'integer', (col) => col.notNull().references('communities.id').onDelete('cascade'))
    .addColumn('user_id', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role', 'varchar(20)', (col) => col.notNull().check(sql`role in ('learner', 'teacher')`))
    .addColumn('joined_at', 'timestamp', (col) => col.defaultTo(db.fn('now')).notNull())
    .addPrimaryKeyConstraint('community_memberships_pkey', ['community_id', 'user_id'])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('community_memberships').ifExists().execute()
}