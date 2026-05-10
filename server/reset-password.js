import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const newPassword = 'yxx456.0.';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const admin = await Admin.findOne({ username: 'admin' });
    if (admin) {
      admin.password = hashedPassword;
      await admin.save();
      console.log('✅ 管理员密码已更新！');
      console.log(`用户名: admin`);
      console.log(`新密码: ${newPassword}`);
    } else {
      console.log('❌ 未找到管理员账号');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
};

resetPassword();
