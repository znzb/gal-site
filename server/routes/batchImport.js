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

        // 解析资源：每个资源单独一列（资源链接1、资源链接2、资源链接3），最多3个
        const parseResources = (row) => {
          const resources = [];
          const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square';
          
          for (let n = 1; n <= 3; n++) {
            const url = String(row[`资源链接${n}`] || '').trim();
            if (!url) continue;
            
            const name = String(row[`资源名称${n}`] || '').trim() || `资源${n}`;
            let resourceType = String(row[`资源类型${n}`] || '游戏本体').trim();
            if (resourceType.includes('游戏') || resourceType.includes('本体')) {
              resourceType = 'main';
            } else if (resourceType.includes('补丁') || resourceType.includes('汉化')) {
              resourceType = 'patch';
            } else if (resourceType.includes('更新')) {
              resourceType = 'update';
            }
            
            resources.push({
              id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${n}`,
              name,
              type: resourceType,
              url,
              size: String(row[`资源大小${n}`] || '').trim(),
              dateDisplay: String(row[`发布日期${n}`] || '').trim() || '3天前',
              language: String(row[`支持语言${n}`] || '简体中文').trim(),
              authorName: String(row[`发布者用户名${n}`] || '愚者').trim(),
              authorAvatar: String(row[`发布者头像${n}`] || defaultAvatar).trim(),
              authorResources: Number(row[`已发布资源数量${n}`] || 198),
              platform: String(row[`资源平台${n}`] || '').trim()
            });
          }
          
          return resources;
        };

        // 解析游戏截图：游戏截图1、游戏截图2、游戏截图3，最多3张
        const parseImages = (row) => {
          const images = [];
          for (let n = 1; n <= 3; n++) {
            const img = String(row[`游戏截图${n}`] || '').trim();
            if (img) images.push(img);
          }
          return images;
        };

        const parseTags = (row) => {
          const tagsStr = String(row['标签'] || row['tags'] || '');
          return tagsStr ? tagsStr.split(/[,，;；|]/).map(t => t.trim()).filter(t => t) : [];
        };

        const parsePlatforms = (row) => {
          const platformsStr = String(row['支持平台'] || row['platforms'] || 'Android');
          const inputPlatforms = platformsStr.split(/[,，;；|]/).map(p => p.trim()).filter(p => p);
          
          // 标准化为英文，和后台编辑界面一致
          const platforms = [];
          inputPlatforms.forEach(p => {
            const lowerP = p.toLowerCase();
            if (lowerP === 'android' || lowerP === '安卓') {
              if (!platforms.includes('Android')) platforms.push('Android');
            } else if (lowerP === 'pc') {
              if (!platforms.includes('PC')) platforms.push('PC');
            } else if (lowerP === 'kr' || lowerP === '韩国') {
              if (!platforms.includes('KR')) platforms.push('KR');
            }
          });
          
          // 如果没有有效平台，默认 Android
          return platforms.length > 0 ? platforms : ['Android'];
        };

        const parseCategories = (row) => {
          const categoriesStr = String(row['分类'] || row['categories'] || 'PC资源');
          return categoriesStr.split(/[,，;；|]/).map(c => c.trim()).filter(c => c);
        };

        const platforms = parsePlatforms(row);
        const tags = parseTags(row);
        
        // 和后台编辑界面一致：根据平台自动设置分类
        let categories = [];
        let primaryCategory = 'Gal游戏';
        
        if (platforms.includes('PC')) {
          categories.push('PC资源');
          primaryCategory = 'PC资源';
        }
        if (platforms.includes('Android') || platforms.includes('KR') || platforms.length > 1) {
          if (!categories.includes('Gal游戏')) {
            categories.push('Gal游戏');
          }
        }
        
        // 如果用户填了分类列，也加进去
        const userCategoriesStr = String(row['分类'] || row['categories'] || '').trim();
        if (userCategoriesStr) {
          const userCategories = userCategoriesStr.split(/[,，;；|]/).map(c => c.trim()).filter(c => c);
          userCategories.forEach(cat => {
            if (!categories.includes(cat)) {
              categories.push(cat);
            }
          });
        }
        
        // 如果用户填了主分类，也加进去
        const userCategory = String(row['主分类'] || row['category'] || '').trim();
        if (userCategory) {
          if (!categories.includes(userCategory)) {
            categories.unshift(userCategory);
          }
          primaryCategory = userCategory;
        }
        
        // 如果没有任何分类，默认 Gal游戏
        if (categories.length === 0) {
          categories = ['Gal游戏'];
        }
        
        const newGame = new Game({
          id,
          name: String(row['游戏名称'] || row['name'] || `游戏${i + 1}`),
          cover: String(row['封面图'] || row['cover'] || ''),
          description: String(row['游戏描述'] || row['description'] || ''),
          category: primaryCategory,
          categories,
          platforms,
          subCategory: String(row['子分类'] || row['subCategory'] || ''),
          isYuzusoft: Boolean(row['柚子社'] || row['isYuzusoft']) || false,
          size: String(row['大小'] || row['size'] || '0MB'),
          releaseDate: String(row['发布日期'] || row['releaseDate'] || new Date().toISOString().split('T')[0]),
          downloads: Number(row['下载量'] || row['downloads'] || 0),
          tags,
          images: parseImages(row),
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
      '游戏截图1': 'https://example.com/screen1.jpg',
      '游戏截图2': 'https://example.com/screen2.jpg',
      '游戏截图3': 'https://example.com/screen3.jpg',
      '游戏描述': '这是一个精彩的游戏',
      '主分类': '',
      '分类': '',
      '支持平台': 'PC,安卓',
      '柚子社': false,
      '大小': '2GB',
      '发布日期': '2024-01-01',
      '下载量': 0,
      '标签': 'RPG,汉化,恋爱',
      '资源名称1': '百度网盘',
      '资源类型1': '游戏本体',
      '支持语言1': '简体中文',
      '资源链接1': 'https://pan.baidu.com/xxx',
      '资源大小1': '2GB',
      '发布日期1': '3天前',
      '发布者用户名1': '愚者',
      '发布者头像1': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      '已发布资源数量1': 198,
      '资源平台1': 'PC',
      '资源名称2': '阿里云盘',
      '资源类型2': '汉化补丁',
      '支持语言2': '简体中文',
      '资源链接2': 'https://www.aliyundrive.com/xxx',
      '资源大小2': '100MB',
      '发布日期2': '2天前',
      '发布者用户名2': '愚者',
      '发布者头像2': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      '已发布资源数量2': 198,
      '资源平台2': '安卓',
      '资源名称3': '夸克网盘',
      '资源类型3': '更新包',
      '支持语言3': '简体中文',
      '资源链接3': 'https://pan.quark.cn/xxx',
      '资源大小3': '50MB',
      '发布日期3': '1天前',
      '发布者用户名3': '愚者',
      '发布者头像3': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      '已发布资源数量3': 198,
      '资源平台3': 'PC'
    },
    {
      'ID': 'game-002',
      '游戏名称': '另一款示例',
      '封面图': 'https://example.com/cover2.jpg',
      '游戏截图1': 'https://example.com/s2-1.jpg',
      '游戏描述': '游戏描述内容',
      '主分类': '',
      '分类': '',
      '支持平台': '安卓',
      '柚子社': false,
      '大小': '500MB',
      '发布日期': '2024-02-01',
      '下载量': 0,
      '标签': '动作',
      '资源名称1': '阿里云盘',
      '资源类型1': '汉化补丁',
      '支持语言1': '繁体中文',
      '资源链接1': 'https://www.aliyundrive.com/xxx',
      '资源大小1': '500MB',
      '发布日期1': '2天前',
      '发布者用户名1': '愚者',
      '发布者头像1': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      '已发布资源数量1': 198,
      '资源平台1': '安卓'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // 设置列宽
  const columnWidths = [
    { wch: 10 },  // ID
    { wch: 20 },  // 游戏名称
    { wch: 30 },  // 封面图
    { wch: 35 },  // 游戏截图1
    { wch: 35 },  // 游戏截图2
    { wch: 35 },  // 游戏截图3
    { wch: 40 },  // 游戏描述
    { wch: 12 },  // 主分类
    { wch: 12 },  // 分类
    { wch: 15 },  // 支持平台
    { wch: 8 },   // 柚子社
    { wch: 10 },  // 大小
    { wch: 12 },  // 发布日期
    { wch: 8 },   // 下载量
    { wch: 20 },  // 标签
    // 资源1
    { wch: 18 },  // 资源名称1
    { wch: 15 },  // 资源类型1
    { wch: 15 },  // 支持语言1
    { wch: 40 },  // 资源链接1
    { wch: 12 },  // 资源大小1
    { wch: 15 },  // 发布日期1
    { wch: 12 },  // 发布者用户名1
    { wch: 40 },  // 发布者头像1
    { wch: 12 },  // 已发布资源数量1
    { wch: 12 },  // 资源平台1
    // 资源2
    { wch: 18 },  // 资源名称2
    { wch: 15 },  // 资源类型2
    { wch: 15 },  // 支持语言2
    { wch: 40 },  // 资源链接2
    { wch: 12 },  // 资源大小2
    { wch: 15 },  // 发布日期2
    { wch: 12 },  // 发布者用户名2
    { wch: 40 },  // 发布者头像2
    { wch: 12 },  // 已发布资源数量2
    { wch: 12 },  // 资源平台2
    // 资源3
    { wch: 18 },  // 资源名称3
    { wch: 15 },  // 资源类型3
    { wch: 15 },  // 支持语言3
    { wch: 40 },  // 资源链接3
    { wch: 12 },  // 资源大小3
    { wch: 15 },  // 发布日期3
    { wch: 12 },  // 发布者用户名3
    { wch: 40 },  // 发布者头像3
    { wch: 12 },  // 已发布资源数量3
    { wch: 12 },  // 资源平台3
  ];
  ws['!cols'] = columnWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '游戏导入');
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=games-template.xlsx');
  res.send(wbout);
});

export default router;
