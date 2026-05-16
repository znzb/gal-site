import express from 'express';
import GroupInfo from '../models/GroupInfo.js';
import { authMiddleware } from './adminAuth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let groupInfo = await GroupInfo.findOne({ id: 'group-info' });
    if (!groupInfo) {
      groupInfo = new GroupInfo();
      await groupInfo.save();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json(groupInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const { groupNumber, groupName, qrCode, description } = req.body;
    let groupInfo = await GroupInfo.findOne({ id: 'group-info' });
    
    if (!groupInfo) {
      groupInfo = new GroupInfo({ id: 'group-info' });
    }
    
    groupInfo.groupNumber = groupNumber || groupInfo.groupNumber;
    groupInfo.groupName = groupName || groupInfo.groupName;
    groupInfo.qrCode = qrCode || groupInfo.qrCode;
    groupInfo.description = description || groupInfo.description;
    groupInfo.updatedAt = new Date();
    
    await groupInfo.save();
    res.json(groupInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
