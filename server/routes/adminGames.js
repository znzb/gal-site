import express from 'express';
import Game from '../models/Game.js';
import { authMiddleware } from './adminAuth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    // 根据分类名称使用和前台一致的过滤逻辑
    if (category) {
      if (category === 'PC资源') {
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
    }
    
    if (search) {
      query = { $and: [query, { name: { $regex: search, $options: 'i' } }] };
    }

    const games = await Game.find(query).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const maxGame = await Game.findOne().sort({ id: -1 });
    const newId = maxGame ? String(parseInt(maxGame.id) + 1) : '1';
    
    const game = new Game({
      ...req.body,
      id: newId
    });
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!game) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOneAndDelete({ id: req.params.id });
    if (!game) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/import-pc', authMiddleware, async (req, res) => {
  try {
    const pcGames = [
      {
        id: 'pc1',
        name: '恋爱物语~夏日回忆',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20visual%20novel%20game%20cover%20summer%20beach%20romance&image_size=portrait_4_3',
        description: '一款精美的恋爱冒险游戏，在夏日的海边小镇展开一段浪漫的爱情故事。',
        category: 'pc资源',
        size: '8.5GB',
        releaseDate: '2024-06-15',
        downloads: 12500,
        tags: ['恋爱', '校园', '治愈'],
        subCategory: 'cooked'
      },
      {
        id: 'pc2',
        name: '永恒幻想',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20game%20cover%20magic%20sword%20heroes&image_size=portrait_4_3',
        description: '史诗级奇幻冒险游戏，探索神秘的魔法世界，成为传奇英雄。',
        category: 'pc资源',
        size: '12.3GB',
        releaseDate: '2024-03-20',
        downloads: 8900,
        tags: ['奇幻', '冒险', '战斗'],
        subCategory: 'raw'
      },
      {
        id: 'pc3',
        name: '樱花树下的约定',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20sakura%20cherry%20blossom%20school%20romance&image_size=portrait_4_3',
        description: '在樱花纷飞的季节，邂逅一段纯真的校园爱情故事。',
        category: 'pc资源',
        size: '6.8GB',
        releaseDate: '2024-04-10',
        downloads: 15600,
        tags: ['恋爱', '校园', '青春'],
        subCategory: 'cooked'
      },
      {
        id: 'pc4',
        name: '星际旅者',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20space%20adventure%20game%20cover%20spaceship%20stars&image_size=portrait_4_3',
        description: '穿越浩瀚宇宙，探索未知星球，展开一段惊心动魄的星际冒险。',
        category: 'pc资源',
        size: '15.2GB',
        releaseDate: '2024-01-15',
        downloads: 9800,
        tags: ['科幻', '冒险', '探索'],
        subCategory: 'raw'
      },
      {
        id: 'pc5',
        name: '机械之心',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20robot%20mecha%20game%20cover%20sci-fi&image_size=portrait_4_3',
        description: '在机械与人类共存的世界，探索人工智能的情感与意识。',
        category: 'pc资源',
        size: '10.1GB',
        releaseDate: '2024-05-20',
        downloads: 7200,
        tags: ['科幻', '剧情', '机器人'],
        subCategory: 'cooked'
      },
      {
        id: 'pc6',
        name: '魔法学园',
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20magic%20academy%20game%20cover%20wizard&image_size=portrait_4_3',
        description: '进入魔法学院，学习各种神奇的魔法，与伙伴们一起冒险。',
        category: 'pc资源',
        size: '9.8GB',
        releaseDate: '2024-02-15',
        downloads: 11000,
        tags: ['魔法', '学园', '冒险'],
        subCategory: 'raw'
      }
    ];

    const results = { added: [], skipped: [] };

    for (const gameData of pcGames) {
      const existingGame = await Game.findOne({ id: gameData.id });
      if (!existingGame) {
        const game = new Game(gameData);
        await game.save();
        results.added.push(gameData.name);
      } else {
        results.skipped.push(gameData.name);
      }
    }

    res.json({
      message: 'PC游戏数据导入完成',
      added: results.added,
      skipped: results.skipped
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
