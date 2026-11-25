import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  AuthApiError,
  fetchCurrentUser,
  loginUser,
  signupUser,
} from '../../client/src/features/auth/api/authApi'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Client authApi fail-closed behavior', () => {
  it('rejects login on 401 Unauthorized without returning a session', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })

    await assert.rejects(
      () => loginUser({ identifier: 'unknown@example.com', password: 'bad' }),
      (err: unknown) => {
        assert.ok(err instanceof AuthApiError)
        assert.equal(err.status, 401)
        assert.equal(err.message, 'Invalid credentials')
        return true
      }
    )
  })

  it('fails closed if login response omits token or user', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ user: { id: 1, username: 'a', email: 'a@b.com' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })

    await assert.rejects(
      () => loginUser({ identifier: 'a@b.com', password: 'password123' }),
      (err: unknown) => err instanceof AuthApiError && err.status === 502
    )
  })

  it('surfaces 409 Conflict on duplicate signup', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ error: 'Username or email is already registered' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      )

    await assert.rejects(
      () =>
        signupUser({
          username: '  Alice ',
          email: ' ALICE@example.com ',
          password: 'password123',
        }),
      (err: unknown) => {
        assert.ok(err instanceof AuthApiError)
        assert.equal(err.status, 409)
        assert.equal(err.message, 'Username or email is already registered')
        return true
      }
    )
  })

  it('fails closed on network error or 401 during session verification', async () => {
    globalThis.fetch = async () => {
      throw new Error('Network down')
    }

    await assert.rejects(
      () => fetchCurrentUser('stale-token'),
      (err: unknown) => err instanceof AuthApiError && err.status === 0
    )

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })

    await assert.rejects(
      () => fetchCurrentUser('expired-token'),
      (err: unknown) => err instanceof AuthApiError && err.status === 401
    )
  })
})
