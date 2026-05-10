import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ 严重错误: JWT_SECRET 环境变量未设置!');
  process.exit(1);
}

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

router.post('/login', async (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const userAttempts = loginAttempts.get(clientIP) || { count: 0, lockUntil: 0 };
    
    if (userAttempts.lockUntil > now) {
      const remainingTime = Math.ceil((userAttempts.lockUntil - now) / 1000 / 60);
      return res.status(429).json({ 
        error: `登录失败次数过多，请在 ${remainingTime} 分钟后重试`,
        retryAfter: remainingTime
      });
    }
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    if (username.length > 50 || password.length > 100) {
      return res.status(400).json({ error: '输入参数过长' });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      userAttempts.count += 1;
      if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        userAttempts.lockUntil = now + LOCKOUT_TIME;
      }
      loginAttempts.set(clientIP, userAttempts);
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      userAttempts.count += 1;
      if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        userAttempts.lockUntil = now + LOCKOUT_TIME;
      }
      loginAttempts.set(clientIP, userAttempts);
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (userAttempts.count > 0) {
      loginAttempts.delete(clientIP);
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { username, newPassword, verificationCode } = req.body;
    
    if (!username || !newPassword || !verificationCode) {
      return res.status(400).json({ error: '用户名、验证码和新密码不能为空' });
    }
    
    if (username.length > 50 || newPassword.length < 8 || newPassword.length > 100) {
      return res.status(400).json({ error: '密码长度需要在8-100位之间' });
    }
    
    const expectedCode = process.env.RESET_CODE;
    if (!expectedCode || verificationCode !== expectedCode) {
      return res.status(403).json({ error: '验证码错误' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ error: '管理员不存在' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('密码重置错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的token' });
  }
};

export { router, authMiddleware };
export default router;
