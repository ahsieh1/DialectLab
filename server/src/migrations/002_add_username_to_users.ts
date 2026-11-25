import { Kysely, sql } from 'kysely'

interface MigrationDatabase {
  users: {
    id: number
    username: string | null
    email: string
  }
}

export async function up(db: Kysely<MigrationDatabase>): Promise<void> {
  const tables = await db.introspection.getTables()
  const usersTable = tables.find((table) => table.name === 'users')
  const hasUsername = usersTable?.columns.some((col) => col.name === 'username') ?? false

  if (hasUsername) {
    return
  }

  await db.schema
    .alterTable('users')
    .addColumn('username', 'varchar(50)')
    .execute()

  // Generate usernames for existing accounts.
  // Appending the user ID ensures that generated usernames are unique.
  await sql`
    UPDATE users
    SET username =
      lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'))
      || '_' || id::text
    WHERE username IS NULL
  `.execute(db)

  await db.schema
    .alterTable('users')
    .alterColumn('username', (col) => col.setNotNull())
    .execute()

  await db.schema
    .createIndex('users_username_unique')
    .on('users')
    .column('username')
    .unique()
    .execute()
}

export async function down(db: Kysely<MigrationDatabase>): Promise<void> {
  await db.schema
    .dropIndex('users_username_unique')
    .ifExists()
    .execute()

  await db.schema
    .alterTable('users')
    .dropColumn('username')
    .execute()
}
