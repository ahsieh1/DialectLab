export type AuthUser = {
  id: number
  username: string
  email: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type SignupResponse = {
  message: string
  user: AuthUser
  token?: string
}

export type SignupPayload = {
  username: string
  email: string
  password: string
}

export type LoginPayload = {
  identifier: string
  password: string
}

export class AuthApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isAuthUser(value: unknown): value is AuthUser {
  if (!isPlainRecord(value)) {
    return false
  }
  return (
    typeof value.id === 'number' &&
    Number.isInteger(value.id) &&
    typeof value.username === 'string' &&
    value.username.length > 0 &&
    typeof value.email === 'string' &&
    value.email.length > 0
  )
}

async function parseJsonRecord(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = await res.json()
    return isPlainRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function extractErrorMessage(data: Record<string, unknown> | null, fallback: string): string {
  if (data && typeof data.error === 'string' && data.error.trim().length > 0) {
    return data.error
  }
  return fallback
}

export async function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  let res: Response
  try {
    res = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: payload.username.trim().toLowerCase(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
    })
  } catch {
    throw new AuthApiError('Unable to connect to server', 0)
  }

  const data = await parseJsonRecord(res)
  if (!res.ok) {
    throw new AuthApiError(extractErrorMessage(data, 'Signup failed'), res.status)
  }

  if (!data || !isAuthUser(data.user)) {
    throw new AuthApiError('Invalid signup response from server', 502)
  }

  return {
    message:
      typeof data.message === 'string'
        ? data.message
        : 'User created successfully',
    user: data.user,
    token: typeof data.token === 'string' ? data.token : undefined,
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  let res: Response
  try {
    res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: payload.identifier.trim().toLowerCase(),
        password: payload.password,
      }),
    })
  } catch {
    throw new AuthApiError('Unable to connect to server', 0)
  }

  const data = await parseJsonRecord(res)
  if (!res.ok) {
    throw new AuthApiError(extractErrorMessage(data, 'Invalid credentials'), res.status)
  }

  const token =
    data && typeof data.token === 'string' && data.token.trim().length > 0
      ? data.token.trim()
      : null

  if (!data || !token || !isAuthUser(data.user)) {
    throw new AuthApiError('Invalid authentication response from server', 502)
  }

  return {
    token,
    user: data.user,
  }
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  let res: Response
  try {
    res = await fetch('/api/users/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new AuthApiError('Unable to connect to server', 0)
  }

  const data = await parseJsonRecord(res)
  if (!res.ok) {
    throw new AuthApiError(
      extractErrorMessage(data, 'Session verification failed'),
      res.status
    )
  }

  if (!data || !isAuthUser(data.user)) {
    throw new AuthApiError('Invalid session response from server', 401)
  }

  return data.user
}
