import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      email: user.email,
      companyName: user.companyName,
      companyDomain: user.companyDomain,
      contactName: user.contactName,
      acceptedTermsAt: user.acceptedTermsAt,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update current user profile
router.put('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { companyName, companyDomain, contactName } = req.body as {
      companyName?: string;
      companyDomain?: string;
      contactName?: string;
    };
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { companyName, companyDomain, contactName } },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      email: user.email,
      companyName: user.companyName,
      companyDomain: user.companyDomain,
      contactName: user.contactName,
      acceptedTermsAt: user.acceptedTermsAt,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    if ((err as any)?.name === 'ValidationError') {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message });
  }
});

export default router;