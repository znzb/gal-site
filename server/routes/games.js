import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
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
    let query;
    
    // 根据分类名称直接通过platforms字段查询
    if (category === 'PC资源') {
      // PC资源：只包含PC平台的游戏，且不包含柚子社，或者兼容旧数据
      query = {
        $and: [
          {
            $or: [
              { platforms: 'PC' },
              { platforms: { $in: ['PC'] } },
              { platforms: { $exists: false }, category: 'PC资源' },
              { platforms: { $exists: false }, category: 'pc资源' }
            ]
          },
          {
            $nor: [
              { platforms: '柚子社' },
              { platforms: { $in: ['柚子社'] } },
              { isYuzusoft: true }
            ]
          }
        ]
      };
    } else if (category === 'Gal游戏') {
      // Gal游戏包含非PC平台，或者同时包含PC和其他平台，且不包含柚子社
      query = {
        $and: [
          {
            $or: [
              { platforms: { $in: ['Android', 'KR'] } },
              { platforms: { $all: ['PC', 'Android'] } },
              { platforms: { $all: ['PC', 'KR'] } },
              { platforms: { $size: 3 } },
              { platforms: { $exists: false }, category: 'Gal游戏' },
              { platforms: { $exists: false }, category: 'gal游戏' }
            ]
          },
          {
            $nor: [
              { platforms: '柚子社' },
              { platforms: { $in: ['柚子社'] } },
              { isYuzusoft: true }
            ]
          }
        ]
      };
    } else if (category === '柚子社') {
      // 柚子社分类：只要平台包含柚子社，或者isYuzusoft为true，就只显示在这里
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
      // 其他分类使用原来的查询方式
      query = { 
        $or: [
          { category: category },
          { categories: category }
        ]
      };
    }
    
    const games = await Game.find(query);
    res.json(games);
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