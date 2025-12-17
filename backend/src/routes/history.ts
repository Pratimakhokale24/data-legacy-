import { Router } from 'express';
import HistoryItem from '../models/HistoryItem';
import User from '../models/User';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const items = await HistoryItem.find({ companyName: me.companyName }).sort({ _id: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, timestamp, legacyData, schema, extractedData } = req.body as any;
    if (!title || !timestamp || !legacyData || !schema || !extractedData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const item = await HistoryItem.create({
      user: req.userId as string,
      companyName: me.companyName,
      title,
      timestamp,
      legacyData,
      schema,
      extractedData
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('History create error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    // Return 400 for validation errors instead of generic 500
    if ((err as any)?.name === 'ValidationError') {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message });
  }
});

export default router;

// Delete a history item by id (only if it belongs to the user)
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const deleted = await HistoryItem.findOneAndDelete({ _id: id, companyName: me.companyName });
    if (!deleted) {
      return res.status(404).json({ error: 'History item not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an existing history item (title, schema, extractedData, legacyData, timestamp)
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, timestamp, legacyData, schema, extractedData } = req.body as any;
    const me = await User.findById(req.userId).select('companyName');
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const updated = await HistoryItem.findOneAndUpdate(
      { _id: id, companyName: me.companyName },
      { $set: { title, timestamp, legacyData, schema, extractedData } },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'History item not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('History update error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    if ((err as any)?.name === 'ValidationError') {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message });
  }
});