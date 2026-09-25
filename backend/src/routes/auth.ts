import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getPoliceOfficers, loginService, registerService } from '../services/authService';
import { loginSchema, registerSchema } from '../validation/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const result = registerSchema.safeParse({ body: req.body });
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: result.error.errors 
      });
    }

    const authResponse = await registerService(result.data.body as any);
    res.status(201).json(authResponse);
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      res.status(409).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const result = loginSchema.safeParse({ body: req.body });
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: result.error.errors 
      });
    }

    const authResponse = await loginService(result.data.body as any);
    res.status(200).json(authResponse);
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req, res) => {
  const user = (req as any).user;
  res.status(200).json({ userId: user.userId, role: user.role });
});

// GET /api/auth/officers - List all police officers (ADMIN only)
router.get('/officers', authenticate, async (req, res) => {
  try {
    const officers = await getPoliceOfficers();
    res.status(200).json(officers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

export default router;