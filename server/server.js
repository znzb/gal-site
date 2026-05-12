import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import gamesRouter from './routes/games.js';
import categoriesRouter from './routes/categories.js';
import featuresRouter from './routes/features.js';
import bannersRouter from './routes/banners.js';
import adminAuthRouter from './routes/adminAuth.js';
import announcementsRouter from './routes/announcements.js';
import adminGamesRouter from './routes/adminGames.js';
import adminCategoriesRouter from './routes/adminCategories.js';
import adminBannersRouter from './routes/adminBanners.js';
import patchRequestsRouter from './routes/patchRequests.js';
import searchLogsRouter from './routes/searchLogs.js';
import operationLogsRouter from './routes/operationLogs.js';
import faqRouter from './routes/faq.js';
import toolsRouter from './routes/tools.js';
import toolGuideRouter from './routes/toolGuide.js';
import Game from './models/Game.js';
import Category from './models/Category.js';
import Feature from './models/Feature.js';
import Banner from './models/Banner.js';
import Admin from './models/Admin.js';
import Announcement from './models/Announcement.js';
import PatchRequest from './models/PatchRequest.js';
import Tool from './models/Tool.js';
import InitFlag from './models/InitFlag.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'https://galzb.cc.cd',
      'https://www.galzb.cc.cd',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

app.use('/api/games', gamesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/features', featuresRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/announcements', announcementsRouter);
app.use('/api/admin/games', adminGamesRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin/banners', adminBannersRouter);
app.use('/api/admin/patch-requests', patchRequestsRouter);
app.use('/api/admin/search-logs', searchLogsRouter);
app.use('/api/admin/operation-logs', operationLogsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/patch-requests', patchRequestsRouter);
app.use('/api/search', searchLogsRouter);
app.use('/api/faq', faqRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/tool-guide', toolGuideRouter);

app.get('/', (req, res) => {
  res.json({ message: '游戏下载网站 API 服务运行中' });
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [
      totalGames,
      totalCategories,
      totalAnnouncements,
      totalPatchRequests
    ] = await Promise.all([
      Game.countDocuments(),
      Category.countDocuments(),
      Announcement?.countDocuments() || 0,
      PatchRequest?.countDocuments() || 0
    ]);

    const recentGames = await Game.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalGames,
      totalCategories,
      totalAnnouncements,
      totalPatchRequests,
      recentGames
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const initAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
      if (process.env.ADMIN_PASSWORD) {
        console.log('使用自定义管理员密码初始化');
      } else {
        console.warn('⚠️ 警告: 未设置 ADMIN_PASSWORD 环境变量，请尽快修改默认密码！');
      }
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword,
        role: 'superadmin'
      });
      await admin.save();
      console.log('✅ 初始化管理员账户成功');
      if (!process.env.ADMIN_PASSWORD) {
        console.log('   默认用户名: admin');
        console.log('   默认密码: ChangeThisPassword123!');
        console.log('   ⚠️ 请立即修改为强密码！');
      }
    }
  } catch (error) {
    console.error('❌ 初始化管理员失败:', error.message);
  }
};

const initData = async () => {
  try {
    await initAdmin();

    const initFlag = await InitFlag.findOne({ name: 'initial_data' });
    if (initFlag && initFlag.initialized) {
      console.log('数据已初始化过，跳过初始化');
      return;
    }

    console.log('初始化数据库数据...');

    const categories = [
      { id: '1', name: '安卓直装', icon: 'gamepad-2' },
      { id: '2', name: 'kr资源', icon: 'image' },
      { id: '3', name: '游戏CG', icon: 'image' },
      { id: '4', name: '图集资源', icon: 'images' },
      { id: '5', name: '新人必读', icon: 'book-open' }
    ];
    await Category.insertMany(categories);

    const games = [
      { id: '1', name: '夏日物语', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20summer%20visual%20novel%20game%20cover%20beautiful%20girl%20beach&image_size=portrait_4_3', description: '一款温馨浪漫的夏日恋爱冒险游戏，讲述主角在海边小镇度过的难忘夏天。', category: '安卓直装', size: '2.5GB', releaseDate: '2024-06-15', downloads: 12500, tags: ['恋爱', '校园', '治愈'] },
      { id: '2', name: '星空幻想', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20game%20cover%20starry%20night%20magic%20girl%20sword&image_size=portrait_4_3', description: '穿越星空的奇幻冒险，与神秘少女一同探索未知的世界。', category: '安卓直装', size: '3.2GB', releaseDate: '2024-03-20', downloads: 8900, tags: ['奇幻', '冒险', '魔法'] },
      { id: '3', name: '樱花飘落时', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20sakura%20cherry%20blossom%20game%20cover%20school%20romance&image_size=portrait_4_3', description: '樱花纷飞的季节，一段青春恋爱故事正在上演。', category: '安卓直装', size: '1.8GB', releaseDate: '2024-04-10', downloads: 15600, tags: ['恋爱', '校园', '青春'] },
      { id: '4', name: '永恒之约', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20eternal%20love%20game%20cover%20fantasy%20castle%20romance&image_size=portrait_4_3', description: '跨越时空的永恒约定，一段超越生死的爱情故事。', category: 'kr资源', size: '4.1GB', releaseDate: '2024-01-15', downloads: 9800, tags: ['奇幻', '爱情', '冒险'] },
      { id: '5', name: '校园日记', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20school%20life%20game%20cover%20classroom%20students%20friends&image_size=portrait_4_3', description: '记录校园生活的点点滴滴，重温青春的美好时光。', category: 'kr资源', size: '2.0GB', releaseDate: '2024-05-28', downloads: 7200, tags: ['校园', '日常', '友情'] },
      { id: '6', name: '幻想世界', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20world%20game%20cover%20dragons%20magic%20heroes&image_size=portrait_4_3', description: '在充满魔法的幻想世界中展开冒险，成为传奇英雄。', category: '安卓直装', size: '5.5GB', releaseDate: '2024-02-28', downloads: 11200, tags: ['奇幻', '冒险', '战斗'] },
      { id: '7', name: '游戏CG精选', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20game%20CG%20collection%20beautiful%20artwork%20gallery&image_size=portrait_4_3', description: '精选游戏CG合集，包含各种精美游戏插画。', category: '游戏CG', size: '1.2GB', releaseDate: '2024-06-01', downloads: 5600, tags: ['CG', '插画', '合集'] },
      { id: '8', name: '高清图集', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20high%20quality%20image%20collection%20beautiful%20girls&image_size=portrait_4_3', description: '高清精美图集，包含各种主题的精美图片。', category: '图集资源', size: '3.8GB', releaseDate: '2024-05-15', downloads: 8200, tags: ['图集', '高清', '壁纸'] }
    ];
    await Game.insertMany(games);

    const features = [
      { id: '1', name: '网站公告', icon: 'megaphone' },
      { id: '2', name: '加入Q群', icon: 'message-circle' },
      { id: '3', name: '柚子社', icon: 'music' },
      { id: '4', name: '补档记录', icon: 'file-text' }
    ];
    await Feature.insertMany(features);

    const banners = [
      { id: '1', image: '/banners/banner1.jpg', title: '夏空彼方', subtitle: 'Summer Pockets' },
      { id: '2', image: '/banners/banner2.jpg', title: '千恋*万花', subtitle: 'Senren Banka' },
      { id: '3', image: '/banners/banner3.jpg', title: '魔女的夜宴', subtitle: "Witch's Night" },
      { id: '4', image: '/banners/banner4.jpg', title: '天使☆嚣嚣 RE-BOOT', subtitle: 'Tenshi Hoshii' }
    ];
    await Banner.insertMany(banners);

    const tools = [
      {
        id: '1',
        name: 'Krkr模拟器',
        description: '适用于运行KRKR引擎游戏的安卓模拟器，支持多种游戏格式',
        size: '45MB',
        tags: ['模拟器', '必备', 'KRKR'],
        icon: 'Download',
        order: 0
      },
      {
        id: '2',
        name: 'ONScripter模拟器',
        description: '运行ONScripter引擎游戏的模拟器，支持多种平台',
        size: '38MB',
        tags: ['模拟器', 'ONS', '必备'],
        icon: 'FileText',
        order: 1
      },
      {
        id: '3',
        name: 'ZArchiver解压工具',
        description: '强大的文件解压工具，支持各种压缩格式',
        size: '8MB',
        tags: ['工具', '解压', '必备'],
        icon: 'Zap',
        order: 2
      },
      {
        id: '4',
        name: 'MT管理器',
        description: '功能强大的文件管理器，支持双面板操作',
        size: '12MB',
        tags: ['工具', '管理', '文件'],
        icon: 'Settings',
        order: 3
      },
      {
        id: '5',
        name: '游戏翻译工具',
        description: '自动翻译游戏文本的工具，支持多种语言',
        size: '25MB',
        tags: ['工具', '翻译', '实用'],
        icon: 'Shield',
        order: 4
      }
    ];
    await Tool.insertMany(tools);

    await InitFlag.create({ name: 'initial_data', initialized: true });

    console.log('✅ 数据初始化完成!');
    console.log(`   - 分类: ${categories.length} 个`);
    console.log(`   - 游戏: ${games.length} 个`);
    console.log(`   - 功能: ${features.length} 个`);
    console.log(`   - 轮播图: ${banners.length} 个`);
    console.log(`   - 工具: ${tools.length} 个`);
  } catch (error) {
    console.error('❌ 数据初始化失败:', error.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
    await initData();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    if (process.env.RENDER_EXTERNAL_URL) {
      const pingInterval = 14 * 60 * 1000;
      setInterval(() => {
        console.log(`[${new Date().toISOString()}] Pinging to prevent cold start...`);
        fetch(process.env.RENDER_EXTERNAL_URL)
          .then(res => console.log(`Ping response: ${res.status}`))
          .catch(err => console.error(`Ping error: ${err.message}`));
      }, pingInterval);
      console.log(`Cold start prevention active - will ping every ${pingInterval / 60000} minutes`);
    }
  });
};

startServer();