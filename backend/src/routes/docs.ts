import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import Document from '../models/Document';
import User from '../models/User';

const router = Router();

// List documents for current user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const docs = await Document.find({ companyName: me.companyName }).sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error('List docs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new document
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, content, keyPoints, notes, tags, fileName } = req.body as any;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const doc = await Document.create({
      user: req.userId as string,
      companyName: me.companyName,
      title,
      content,
      keyPoints,
      notes,
      tags,
      fileName,
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Create doc error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    if ((err as any)?.name === 'ValidationError') {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message });
  }
});

// Update a document
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content, keyPoints, notes, tags, fileName } = req.body as any;
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const doc = await Document.findOneAndUpdate(
      { _id: id, companyName: me.companyName },
      { $set: { title, content, keyPoints, notes, tags, fileName } },
      { new: true, runValidators: true }
    );
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (err) {
    console.error('Update doc error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    if ((err as any)?.name === 'ValidationError') {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message });
  }
});

// Delete a document
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const deleted = await Document.findOneAndDelete({ _id: id, companyName: me.companyName });
    if (!deleted) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete doc error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;