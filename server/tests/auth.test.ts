import { after, before, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import bcrypt from 'bcrypt'
import {
  CompiledQuery,
  DatabaseConnection,
  Driver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  QueryResult,
} from 'kysely'
import type { Database } from '../src/database'
import { createApp } from '../src/app'

interface StoredUser {
  id: number
  username: string
  email: string
  pass_hash: string
  created_at: Date
  last_active_at: Date
}

class InMemoryPgDriver implements Driver {
  users: StoredUser[] = []
  nextId = 1
  executedQueries: CompiledQuery[] = []
  failNextQuery = false

  reset(): void {
    this.users = []
    this.nextId = 1
    this.executedQueries = []
    this.failNextQuery = false
  }

  async init(): Promise<void> {}

  async acquireConnection(): Promise<DatabaseConnection> {
    const driver = this
    return {
      async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
        driver.executedQueries.push(compiledQuery)
        if (driver.failNextQuery) {
          driver.failNextQuery = false
          throw new Error('Simulated PostgreSQL connection failure')
        }

        const sql = compiledQuery.sql.toLowerCase()
        const params = compiledQuery.parameters

        if (sql.startsWith('insert into "users"')) {
          const [username, email, passHash] = params as [string, string, string]
          const duplicate = driver.users.some(
            (u) => u.username === username || u.email === email
          )
          if (duplicate) {
            const err = new Error('duplicate key value violates unique constraint') as Error & {
              code: string
            }
            err.code = '23505'
            throw err
          }

          const now = new Date()
          const row: StoredUser = {
            id: driver.nextId++,
            username,
            email,
            pass_hash: passHash,
            created_at: now,
            last_active_at: now,
          }
          driver.users.push(row)
          return {
            rows: [
              {
                id: row.id,
                username: row.username,
                email: row.email,
              } as unknown as R,
            ],
          }
        }

        if (sql.startsWith('select') && sql.includes('from "users"')) {
          if (sql.includes('"email" = $1 or "username" = $2')) {
            const [emailParam, usernameParam] = params as [string, string]
            const match = driver.users.find(
              (u) => u.email === emailParam || u.username === usernameParam
            )
            return { rows: (match ? [match] : []) as unknown as R[] }
          }

          if (sql.includes('"id" = $1')) {
            const [idParam] = params as [number]
            const match = driver.users.find((u) => u.id === idParam)
            return {
              rows: (match
                ? [{ id: match.id, username: match.username, email: match.email }]
                : []) as unknown as R[],
            }
          }
        }

        if (sql.startsWith('update "users" set "last_active_at" = now() where "id" = $1')) {
          const [idParam] = params as [number]
          const match = driver.users.find((u) => u.id === idParam)
          if (match) {
            match.last_active_at = new Date()
          }
          return { rows: [] as R[], numAffectedRows: BigInt(match ? 1 : 0) }
        }

        throw new Error(`Unexpected query in test driver: ${compiledQuery.sql}`)
      },

      async *streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
        throw new Error('Streaming not implemented in test driver')
      },
    }
  }

  async beginTransaction(): Promise<void> {}
  async commitTransaction(): Promise<void> {}
  async rollbackTransaction(): Promise<void> {}
  async releaseConnection(): Promise<void> {}
  async destroy(): Promise<void> {}
}

describe('Auth API with Kysely PostgreSQL query builder', () => {
  const driver = new InMemoryPgDriver()
  const testDb = new Kysely<Database>({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => driver,
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  })

  let server: Server
  let baseUrl = ''
  const originalJwtSecret = process.env.JWT_SECRET

  before(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_value'
    const app = createApp(testDb)
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo
        baseUrl = `http://127.0.0.1:${addr.port}`
        resolve()
      })
    })
  })

  after(async () => {
    process.env.JWT_SECRET = originalJwtSecret
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()))
    })
  })

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_value'
    driver.reset()
  })

  it('persists a normalized user with a bcrypt password hash on signup', async () => {
    const res = await fetch(`${baseUrl}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: '  Alice_One  ',
        email: '  Alice@Example.COM ',
        password: 'StrongPassword123',
      }),
    })

    assert.equal(res.status, 201)
    const body = (await res.json()) as {
      token: string
      user: { id: number; username: string; email: string }
    }

    assert.equal(body.user.username, 'alice_one')
    assert.equal(body.user.email, 'alice@example.com')
    assert.ok(typeof body.token === 'string' && body.token.length > 0)

    assert.equal(driver.users.length, 1)
    const saved = driver.users[0]
    assert.equal(saved.username, 'alice_one')
    assert.equal(saved.email, 'alice@example.com')
    assert.notEqual(saved.pass_hash, 'StrongPassword123')
    assert.equal(await bcrypt.compare('StrongPassword123', saved.pass_hash), true)
    assert.ok(
      driver.executedQueries.some((q) =>
        q.sql.includes('insert into "users" ("username", "email", "pass_hash")')
      )
    )
  })

  it('returns 409 Conflict on duplicate email or username regardless of case/whitespace', async () => {
    await fetch(`${baseUrl}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'bob_dev',
        email: 'bob@example.com',
        password: 'Password123',
      }),
    })

    const dupEmailRes = await fetch(`${baseUrl}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'bob_other',
        email: '  BOB@Example.com ',
        password: 'Password123',
      }),
    })
    assert.equal(dupEmailRes.status, 409)

    const dupUserRes = await fetch(`${baseUrl}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: '  Bob_Dev ',
        email: 'bob2@example.com',
        password: 'Password123',
      }),
    })
    assert.equal(dupUserRes.status, 409)
    assert.equal(driver.users.length, 1)
  })

  it('rejects invalid signup payloads with 400 and writes nothing', async () => {
    const res = await fetch(`${baseUrl}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ab',
        email: 'not-an-email',
        password: '123',
      }),
    })

    assert.equal(res.status, 400)
    assert.equal(driver.users.length, 0)
  })

  it('authenticates registered users by email or username (case-insensitive) and rejects unknown/wrong credentials with 401', async () => {
    await fetch(`${baseUrl}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'carol_lang',
        email: 'carol@example.com',
        password: 'CarolPassword!',
      }),
    })

    const initialLastActive = new Date(0)
    driver.users[0].last_active_at = initialLastActive

    const loginByEmail = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '  CAROL@Example.COM ',
        password: 'CarolPassword!',
      }),
    })
    assert.equal(loginByEmail.status, 200)
    const emailSession = (await loginByEmail.json()) as {
      token: string
      user: { id: number; username: string; email: string }
    }
    assert.ok(emailSession.token.length > 0)
    assert.equal(emailSession.user.username, 'carol_lang')
    assert.ok(
      driver.users[0].last_active_at.getTime() > initialLastActive.getTime(),
      'Expected last_active_at to be updated on successful login'
    )
    assert.ok(
      driver.executedQueries.some((q) =>
        q.sql.includes('update "users" set "last_active_at"')
      )
    )

    const loginByUsername = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '  Carol_Lang ',
        password: 'CarolPassword!',
      }),
    })
    assert.equal(loginByUsername.status, 200)

    const afterValidLogin = driver.users[0].last_active_at
    const updateCountBeforeFailed = driver.executedQueries.filter((q) =>
      q.sql.includes('update "users" set "last_active_at"')
    ).length

    const unknownRes = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'never_registered@example.com',
        password: 'any_password',
      }),
    })
    assert.equal(unknownRes.status, 401)
    const unknownBody = (await unknownRes.json()) as { error: string; token?: string }
    assert.equal(unknownBody.error, 'Invalid credentials')
    assert.equal(unknownBody.token, undefined)

    const wrongPassRes = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'carol@example.com',
        password: 'WrongPassword!',
      }),
    })
    assert.equal(wrongPassRes.status, 401)
    const wrongPassBody = (await wrongPassRes.json()) as { error: string; token?: string }
    assert.equal(wrongPassBody.error, 'Invalid credentials')
    assert.equal(wrongPassBody.token, undefined)

    const updateCountAfterFailed = driver.executedQueries.filter((q) =>
      q.sql.includes('update "users" set "last_active_at"')
    ).length
    assert.equal(updateCountAfterFailed, updateCountBeforeFailed)
    assert.equal(driver.users[0].last_active_at, afterValidLogin)
  })

  it('enforces strict JWT verification on GET /api/users/profile', async () => {
    const unauthRes = await fetch(`${baseUrl}/api/users/profile`)
    assert.equal(unauthRes.status, 401)

    const badTokenRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: 'Bearer not-a-valid-jwt' },
    })
    assert.equal(badTokenRes.status, 401)

    const signupRes = await fetch(`${baseUrl}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dave_user',
        email: 'dave@example.com',
        password: 'DavePassword1',
      }),
    })
    const { token } = (await signupRes.json()) as { token: string }

    const profileRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.equal(profileRes.status, 200)
    const profileBody = (await profileRes.json()) as {
      user: { id: number; username: string; email: string }
    }
    assert.equal(profileBody.user.username, 'dave_user')

    // Simulate deleted user in DB: token must fail closed with 401
    driver.users = []
    const deletedUserRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.equal(deletedUserRes.status, 401)
  })

  it('fails closed on database query errors and missing JWT_SECRET', async () => {
    driver.failNextQuery = true
    const dbErrRes = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'any@example.com',
        password: 'password123',
      }),
    })
    assert.equal(dbErrRes.status, 500)
    const dbErrBody = (await dbErrRes.json()) as { token?: string }
    assert.equal(dbErrBody.token, undefined)

    delete process.env.JWT_SECRET
    const noSecretProfile = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: 'Bearer some.jwt.token' },
    })
    assert.equal(noSecretProfile.status, 500)
  })
})
