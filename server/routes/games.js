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
    
    // 判断是否包含特定平台（支持中英文）
    const hasPlatform = (gamePlatforms, platformNames) => {
      if (!gamePlatforms) return false;
      if (typeof gamePlatforms === 'string') {
        return platformNames.some(p => gamePlatforms.includes(p));
      }
      if (Array.isArray(gamePlatforms)) {
        return gamePlatforms.some(gp => platformNames.some(p => gp.includes(p)));
      }
      return false;
    };
    
    // 判断是否是柚子社游戏
    const isYuzusoftGame = (game) => {
      return game.isYuzusoft || 
             (game.platforms && (
               (typeof game.platforms === 'string' && game.platforms.includes('柚子社')) ||
               (Array.isArray(game.platforms) && game.platforms.some(p => p.includes('柚子社')))
             )) ||
             game.category === '柚子社' ||
             (game.categories && game.categories.includes('柚子社'));
    };
    
    if (category === 'PC资源') {
      // PC资源：包含PC平台，且不是柚子社
      query = {
        $and: [
          {
            $or: [
              { platforms: 'PC' },
              { platforms: { $in: ['PC'] } },
              { platforms: { $exists: false }, category: 'PC资源' },
              { platforms: { $exists: false }, category: 'pc资源' },
              // 支持字符串包含PC
              { platforms: { $regex: 'PC', $options: 'i' } }
            ]
          },
          { isYuzusoft: { $ne: true } }
        ]
      };
    } else if (category === 'Gal游戏') {
      // Gal游戏：包含非PC平台（Android/安卓/KR），且不是柚子社
      // 同时支持PC+Android的游戏也会显示在这里
      query = {
        $and: [
          {
            $or: [
              // 包含安卓/Android
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
      // 柚子社分类
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
    
    // 后处理过滤，确保柚子社游戏只在柚子社分类
    const filteredGames = games.filter(game => {
      if (category === '柚子社') {
        return true; // 柚子社分类不过滤
      }
      // 其他分类过滤掉柚子社游戏
      return !isYuzusoftGame(game);
    });
    
    res.json(filteredGames);
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