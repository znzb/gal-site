import express from 'express';
import SearchLog from '../models/SearchLog.js';
import { authMiddleware } from './adminAuth.js';

const router = express.Router();

router.get('/trending', async (req, res) => {
  try {
    const logs = await SearchLog.find()
      .sort({ count: -1 })
      .limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const logs = await SearchLog.find()
      .sort({ lastSearched: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { keyword } = req.body;
    let log = await SearchLog.findOne({ keyword });
    
    if (log) {
      log.count += 1;
      log.lastSearched = new Date();
    } else {
      log = new SearchLog({ keyword });
    }
    
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;