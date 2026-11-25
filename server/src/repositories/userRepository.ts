import { Kysely } from 'kysely'
import { Database, NewUser, User, db } from '../database'

export type PublicUser = Pick<User, 'id' | 'username' | 'email'>

/**
 * Normalize usernames and email addresses so writes and lookups are case- and whitespace-insensitive.
 */
export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Persist a new user in PostgreSQL and return the public projection after commit.
 */
export async function createUser(
  input: Pick<NewUser, 'username' | 'email' | 'pass_hash'>,
  database: Kysely<Database> = db
): Promise<PublicUser> {
  const created = await database
    .insertInto('users')
    .values({
      username: normalizeIdentifier(input.username),
      email: normalizeIdentifier(input.email),
      pass_hash: input.pass_hash,
    })
    .returning(['id', 'username', 'email'])
    .executeTakeFirst()

  if (!created) {
    throw new Error('Failed to persist user record')
  }

  return created
}

/**
 * Look up a user by normalized email or username for credential verification.
 */
export async function findUserByIdentifier(
  identifier: string,
  database: Kysely<Database> = db
): Promise<User | undefined> {
  const normalized = normalizeIdentifier(identifier)
  if (!normalized) {
    return undefined
  }

  return database
    .selectFrom('users')
    .select(['id', 'username', 'email', 'pass_hash', 'created_at', 'last_active_at'])
    .where((eb) =>
      eb.or([eb('email', '=', normalized), eb('username', '=', normalized)])
    )
    .executeTakeFirst()
}

/**
 * Look up a user's non-sensitive profile fields by primary key.
 */
export async function findUserById(
  id: number,
  database: Kysely<Database> = db
): Promise<PublicUser | undefined> {
  return database
    .selectFrom('users')
    .select(['id', 'username', 'email'])
    .where('id', '=', id)
    .executeTakeFirst()
}

/**
 * Update the last_active_at timestamp for an authenticated user.
 */
export async function touchLastActiveAt(
  id: number,
  database: Kysely<Database> = db
): Promise<void> {
  await database
    .updateTable('users')
    .set({ last_active_at: database.fn<Date>('now') })
    .where('id', '=', id)
    .executeTakeFirst()
}
