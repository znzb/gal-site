import express from 'express';
import ToolGuide from '../models/ToolGuide.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let guide = await ToolGuide.findOne();
    if (!guide) {
      guide = await ToolGuide.create({
        title: '使用说明',
        items: [
          { order: 0, content: '下载并安装所需的工具' },
          { order: 1, content: '根据游戏格式选择对应的模拟器' },
          { order: 2, content: '将游戏文件导入模拟器即可开始游玩' }
        ]
      });
    }
    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { title, items } = req.body;
    let guide = await ToolGuide.findOne();
    if (!guide) {
      guide = new ToolGuide();
    }
    if (title) guide.title = title;
    if (items) guide.items = items;
    guide.updatedAt = Date.now();
    await guide.save();
    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;