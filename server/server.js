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
    console.log('✅ 数据库初始化检查完成');
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
      const pingInterval = 10 * 60 * 1000; // 缩短到10分钟
      
      // 立即发送一次ping
      const sendPing = async () => {
        try {
          console.log(`[${new Date().toISOString()}] Pinging to prevent cold start...`);
          const res = await fetch(process.env.RENDER_EXTERNAL_URL);
          console.log(`Ping response: ${res.status}`);
        } catch (err) {
          console.error(`Ping error: ${err.message}`);
        }
      };
      
      // 立即ping一次
      sendPing();
      
      // 设置定时器
      setInterval(sendPing, pingInterval);
      console.log(`Cold start prevention active - will ping every ${pingInterval / 60000} minutes`);
    }
  });
};

startServer();