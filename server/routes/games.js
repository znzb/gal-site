import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

// 列表页默认裁剪掉大字段，提升响应速度
// resources 只取第一个元素（用于显示大小），避免返回全部资源
const LIST_FIELDS = '-comments -images';

// 构建模糊搜索条件（名称、描述、分类、标签）
const buildSearchQuery = (keyword) => {
  if (!keyword) return {};
  const k = keyword.trim();
  if (!k) return {};
  const regex = { $regex: k, $options: 'i' };
  return {
    $or: [
      { name: regex },
      { description: regex },
      { category: regex },
      { tags: regex }
    ]
  };
};

router.get('/', async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const searchQuery = buildSearchQuery(search);

    // 无分页参数时保持兼容，但裁剪大字段并限制返回数量（避免4000+条超时）
    if (!page && !limit) {
      const games = await Game.find(searchQuery).select(LIST_FIELDS).slice('resources', 1).limit(100).lean();
      return res.json(games);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [games, total] = await Promise.all([
      Game.find(searchQuery).select(LIST_FIELDS).slice('resources', 1).skip(skip).limit(limitNum).lean(),
      Game.countDocuments(searchQuery)
    ]);

    res.json({
      games,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const gameId = String(req.params.id);
    const game = await Game.findOne({ id: gameId });
    if (!game) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const { page, limit } = req.query;
    let query;

    if (category === 'PC资源') {
      query = {
        $and: [
          {
            $or: [
              { platforms: 'PC' },
              { platforms: { $in: ['PC'] } },
              { platforms: { $exists: false }, category: 'PC资源' },
              { platforms: { $exists: false }, category: 'pc资源' },
              { platforms: { $regex: 'PC', $options: 'i' } }
            ]
          },
          { isYuzusoft: { $ne: true } }
        ]
      };
    } else if (category === 'Gal游戏') {
      query = {
        $and: [
          {
            $or: [
              { platforms: 'Android' },
              { platforms: { $in: ['Android', '安卓', 'KR'] } },
              { platforms: { $regex: 'Android|安卓|KR', $options: 'i' } },
              { platforms: { $exists: false }, category: 'Gal游戏' },
              { platforms: { $exists: false }, category: 'gal游戏' }
            ]
          },
          { isYuzusoft: { $ne: true } }
        ]
      };
    } else if (category === '柚子社') {
      query = {
        $or: [
          { platforms: '柚子社' },
          { platforms: { $in: ['柚子社'] } },
          { isYuzusoft: true },
          { category: '柚子社' },
          { categories: '柚子社' }
        ]
      };
    } else {
      query = { 
        $or: [
          { category: category },
          { categories: category }
        ]
      };
    }
    
    // 无分页时保持兼容，但裁剪大字段并限制返回数量
    if (!page && !limit) {
      const games = await Game.find(query).select(LIST_FIELDS).slice('resources', 1).limit(100).lean();
      return res.json(games);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [games, total] = await Promise.all([
      Game.find(query).select(LIST_FIELDS).slice('resources', 1).skip(skip).limit(limitNum).lean(),
      Game.countDocuments(query)
    ]);

    res.json({
      games,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const game = new Game(req.body);
  try {
    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedGame = await Game.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedGame) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedGame = await Game.findOneAndDelete({ id: req.params.id });
    if (!deletedGame) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    res.json({ message: '游戏已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/download', async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    game.downloads += 1;
    await game.save();
    res.json({ downloads: game.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;