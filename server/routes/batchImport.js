import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import Game from '../models/Game.js';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: '工作表为空' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const id = String(row['ID'] || row['id'] || `game-${Date.now()}-${i}`);
        const existing = await Game.findOne({ id });
        
        if (existing) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            name: row['游戏名称'] || row['name'],
            error: '游戏已存在'
          });
          continue;
        }

        const parseResources = (row) => {
          const resources = [];
          
          if (row['资源名称'] || row['资源链接']) {
            resources.push({
              id: `res-${Date.now()}-${i}`,
              name: String(row['资源名称'] || row['资源链接'] || '主资源'),
              url: String(row['资源链接'] || row['资源名称'] || ''),
              type: 'main',
              size: String(row['资源大小'] || row['size'] || ''),
              date: String(row['更新日期'] || row['date'] || ''),
              language: String(row['语言'] || row['language'] || '简体中文'),
              platform: String(row['平台'] || row['platform'] || 'PC'),
              dateDisplay: String(row['更新日期'] || row['date'] || '')
            });
          }
          
          return resources;
        };

        const parseTags = (row) => {
          const tagsStr = String(row['标签'] || row['tags'] || '');
          return tagsStr ? tagsStr.split(/[,，;；|]/).map(t => t.trim()).filter(t => t) : [];
        };

        const parsePlatforms = (row) => {
          const platformsStr = String(row['支持平台'] || row['platforms'] || 'PC');
          return platformsStr.split(/[,，;；|]/).map(p => p.trim()).filter(p => p);
        };

        const parseCategories = (row) => {
          const categoriesStr = String(row['分类'] || row['categories'] || 'PC资源');
          return categoriesStr.split(/[,，;；|]/).map(c => c.trim()).filter(c => c);
        };

        const newGame = new Game({
          id,
          name: String(row['游戏名称'] || row['name'] || `游戏${i + 1}`),
          cover: String(row['封面图'] || row['cover'] || ''),
          description: String(row['游戏描述'] || row['description'] || ''),
          category: String(row['主分类'] || row['category'] || 'PC资源'),
          categories: parseCategories(row),
          platforms: parsePlatforms(row),
          subCategory: String(row['子分类'] || row['subCategory'] || ''),
          isYuzusoft: Boolean(row['柚子社'] || row['isYuzusoft']) || false,
          size: String(row['大小'] || row['size'] || '0MB'),
          releaseDate: String(row['发布日期'] || row['releaseDate'] || new Date().toISOString().split('T')[0]),
          downloads: Number(row['下载量'] || row['downloads'] || 0),
          tags: parseTags(row),
          resources: parseResources(row),
          comments: []
        });

        await newGame.save();
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: i + 2,
          name: row['游戏名称'] || row['name'],
          error: err.message
        });
      }
    }

    res.json({
      message: `导入完成：成功 ${results.success} 个，失败 ${results.failed} 个`,
      results,
      total: data.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/template', (req, res) => {
  const templateData = [
    {
      'ID': 'game-001',
      '游戏名称': '示例游戏',
      '封面图': 'https://example.com/cover.jpg',
      '游戏描述': '游戏描述内容',
      '主分类': 'PC资源',
      '分类': 'PC资源',
      '支持平台': 'PC',
      '柚子社': false,
      '大小': '2GB',
      '发布日期': '2024-01-01',
      '下载量': 0,
      '标签': 'RPG,汉化',
      '资源名称': '百度网盘',
      '资源链接': 'https://pan.baidu.com/xxx',
      '资源大小': '2GB',
      '更新日期': '2024-01-01',
      '语言': '简体中文',
      '平台': 'PC'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '游戏导入');
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=games-template.xlsx');
  res.send(wbout);
});

export default router;
