import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

// 批量导入游戏
router.post('/batch-import', async (req, res) => {
  try {
    const { games } = req.body;
    
    if (!Array.isArray(games) || games.length === 0) {
      return res.status(400).json({ error: '请提供有效的游戏数组' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      
      try {
        // 检查是否已存在
        const existing = await Game.findOne({ id: game.id });
        if (existing) {
          results.failed++;
          results.errors.push({
            index: i,
            name: game.name,
            error: '游戏已存在'
          });
          continue;
        }

        // 创建新游戏
        const newGame = new Game({
          id: game.id,
          name: game.name,
          cover: game.cover || '',
          description: game.description || '',
          category: game.category || 'PC资源',
          categories: game.categories || [],
          platforms: game.platforms || ['PC'],
          subCategory: game.subCategory || '',
          isYuzusoft: game.isYuzusoft || false,
          size: game.size || '0MB',
          releaseDate: game.releaseDate || new Date().toISOString(),
          downloads: game.downloads || 0,
          tags: game.tags || [],
          resources: game.resources || [],
          comments: []
        });

        await newGame.save();
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          index: i,
          name: game.name,
          error: err.message
        });
      }
    }

    res.json({
      message: `导入完成：成功 ${results.success} 个，失败 ${results.failed} 个`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出游戏模板
router.get('/template', (req, res) => {
  const template = {
    games: [
      {
        id: "game-001",
        name: "游戏名称",
        cover: "https://example.com/cover.jpg",
        description: "游戏描述",
        category: "PC资源",
        categories: ["PC资源"],
        platforms: ["PC"],
        subCategory: "",
        isYuzusoft: false,
        size: "2GB",
        releaseDate: "2024-01-01",
        downloads: 0,
        tags: ["RPG", "汉化"],
        resources: [
          {
            name: "百度网盘",
            url: "https://pan.baidu.com/xxx",
            type: "main",
            size: "2GB",
            date: "2024-01-01",
            language: "简体中文",
            platform: "PC"
          }
        ]
      }
    ]
  };
  
  res.json(template);
});

export default router;
