import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { db } from '../database'; // Uncomment this later once the DB schema is ready

const router = Router();

// Middleware to verify JWT token
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// POST /api/users/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // TODO: Insert new user into the database using Kysely
    // const newUser = await db.insertInto('users').values({ username, email, password_hash: hashedPassword }).returningAll().executeTakeFirst();
    
    res.status(201).json({ message: 'User created successfully (Placeholder)' }); 
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /api/users/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Fetch user by email using Kysely
    // const user = await db.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst();
    
    const user = { id: 1, email, password: 'hashed_password_placeholder' }; // Mock user for testing
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // TODO: Compare passwords once DB is connected
    // const validPassword = await bcrypt.compare(password, user.password);
    // if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    
    res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    // TODO: Fetch user profile using req.user.id
    // const userProfile = await db.selectFrom('users').select(['id', 'username', 'email']).where('id', '=', req.user.id).executeTakeFirst();
    
    res.status(200).json({ profile: 'User profile data will go here', userId: req.user.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

export default router;