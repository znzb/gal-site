import express from 'express';
import OperationLog from '../models/OperationLog.js';
import { authMiddleware } from './adminAuth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const logs = await OperationLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('adminId', 'username');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;