import express from 'express';
import SearchLog from '../models/SearchLog.js';
import { authMiddleware } from './adminAuth.js';

const router = express.Router();

// 记录搜索（公开接口）
router.post('/', async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ message: '关键词不能为空' });
    }
    const kw = keyword.trim();
    const log = await SearchLog.findOne({ keyword: kw });
    if (log) {
      log.count += 1;
      log.lastSearched = new Date();
      await log.save();
    } else {
      await SearchLog.create({ keyword: kw, count: 1, lastSearched: new Date() });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 热门搜索（公开）
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await SearchLog.find()
      .sort({ count: -1, lastSearched: -1 })
      .limit(limit)
      .lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 管理端：热门搜索统计
router.get('/admin/trending', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await SearchLog.find()
      .sort({ count: -1, lastSearched: -1 })
      .limit(limit)
      .lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
