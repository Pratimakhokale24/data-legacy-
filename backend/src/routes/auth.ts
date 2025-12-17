import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName, companyDomain, contactName, acceptTerms } = req.body as {
      email?: string;
      password?: string;
      companyName?: string;
      companyDomain?: string;
      contactName?: string;
      acceptTerms?: boolean;
    };
    if (!email || !password || !companyName || !contactName) {
      return res.status(400).json({ error: 'Company name, contact, email and password are required' });
    }
    const lowerEmail = email.toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(lowerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if ((password ?? '').length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    if (acceptTerms !== true) {
      return res.status(400).json({ error: 'You must accept the terms to register' });
    }

    const existing = await User.findOne({ email: lowerEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: lowerEmail,
      passwordHash,
      companyName,
      companyDomain,
      contactName,
      acceptedTermsAt: new Date(),
    });
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ token, email: user.email });
  } catch (err) {
    console.error('Register error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    res.status(500).json({ error: message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const lowerEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ token, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    res.status(500).json({ error: message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ email: (req as any).userEmail });
});

export default router;