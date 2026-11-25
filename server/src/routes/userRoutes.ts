import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Kysely } from 'kysely'
import { Database, db } from '../database'
import {
  createUser,
  findUserById,
  findUserByIdentifier,
  normalizeIdentifier,
  touchLastActiveAt,
} from '../repositories/userRepository'

const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6
const MAX_PASSWORD_LENGTH = 128

interface AuthenticatedRequest extends Request {
  user?: {
    id: number
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured')
  }
  return secret
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }
  const pgError = error as { code?: unknown; cause?: unknown }
  if (pgError.code === '23505') {
    return true
  }
  if (pgError.cause && typeof pgError.cause === 'object') {
    return (pgError.cause as { code?: unknown }).code === '23505'
  }
  return false
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (typeof authHeader !== 'string') {
    return null
  }
  const match = /^Bearer\s+(\S+)$/i.exec(authHeader.trim())
  return match ? match[1] : null
}

/**
 * Middleware that requires a valid signed Bearer JWT and rejects unauthenticated requests.
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req.headers.authorization)
  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  let secret: string
  try {
    secret = getJwtSecret()
  } catch (error) {
    console.error('JWT configuration error:', error)
    res.status(500).json({ error: 'Authentication service unavailable' })
    return
  }

  jwt.verify(
    token,
    secret,
    (
      err: jwt.VerifyErrors | null,
      decoded: string | jwt.JwtPayload | undefined
    ) => {
      if (
        err ||
        !decoded ||
        typeof decoded === 'string' ||
        typeof decoded.id !== 'number' ||
        !Number.isInteger(decoded.id)
      ) {
        res.status(401).json({ error: 'Invalid or expired token' })
        return
      }

      req.user = { id: decoded.id }
      next()
    }
  )
}

/**
 * Build user authentication routes backed by Kysely.
 */
export function createUserRouter(database: Kysely<Database> = db): Router {
  const router = Router()

  // POST /api/users/signup
  router.post('/signup', async (req: Request, res: Response) => {
    try {
      if (!isPlainObject(req.body)) {
        res.status(400).json({ error: 'Invalid request payload' })
        return
      }

      const rawUsername = req.body.username
      const rawEmail = req.body.email
      const rawPassword = req.body.password

      if (
        typeof rawUsername !== 'string' ||
        typeof rawEmail !== 'string' ||
        typeof rawPassword !== 'string'
      ) {
        res.status(400).json({ error: 'Username, email, and password are required' })
        return
      }

      const username = normalizeIdentifier(rawUsername)
      const email = normalizeIdentifier(rawEmail)

      if (!USERNAME_PATTERN.test(username)) {
        res.status(400).json({
          error:
            'Username must be 3–30 characters using letters, numbers, underscores, dots, or hyphens',
        })
        return
      }

      if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
        res.status(400).json({ error: 'Please enter a valid email address' })
        return
      }

      if (
        rawPassword.length < MIN_PASSWORD_LENGTH ||
        rawPassword.length > MAX_PASSWORD_LENGTH
      ) {
        res.status(400).json({
          error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
        })
        return
      }

      const passHash = await bcrypt.hash(rawPassword, 10)
      const newUser = await createUser(
        {
          username,
          email,
          pass_hash: passHash,
        },
        database
      )

      const token = jwt.sign({ id: newUser.id }, getJwtSecret(), {
        expiresIn: '1h',
      })

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: newUser,
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        res.status(409).json({ error: 'Username or email is already registered' })
        return
      }
      console.error('Signup error:', error)
      res.status(500).json({ error: 'Server error during signup' })
    }
  })

  // POST /api/users/login
  router.post('/login', async (req: Request, res: Response) => {
    try {
      if (!isPlainObject(req.body)) {
        res.status(400).json({ error: 'Invalid request payload' })
        return
      }

      const rawIdentifier =
        req.body.identifier ??
        req.body.login ??
        req.body.email ??
        req.body.username
      const rawPassword = req.body.password

      if (
        typeof rawIdentifier !== 'string' ||
        typeof rawPassword !== 'string'
      ) {
        res
          .status(400)
          .json({ error: 'Username or email and password are required' })
        return
      }

      const identifier = normalizeIdentifier(rawIdentifier)
      if (!identifier || !rawPassword) {
        res
          .status(400)
          .json({ error: 'Username or email and password are required' })
        return
      }

      const user = await findUserByIdentifier(identifier, database)
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      const validPassword = await bcrypt.compare(rawPassword, user.pass_hash)
      if (!validPassword) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      const secret = getJwtSecret()
      await touchLastActiveAt(user.id, database)

      const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: '1h',
      })

      res.status(200).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Server error during login' })
    }
  })

  // GET /api/users/profile
  router.get(
    '/profile',
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' })
          return
        }

        const userProfile = await findUserById(req.user.id, database)
        if (!userProfile) {
          res.status(401).json({ error: 'Invalid or expired token' })
          return
        }

        res.status(200).json({ user: userProfile })
      } catch (error) {
        console.error('Profile lookup error:', error)
        res.status(500).json({ error: 'Server error fetching profile' })
      }
    }
  )

  return router
}

export default createUserRouter()
