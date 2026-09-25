import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = 'mongodb://Gal:gal147.0.@ac-eavgb6c-shard-00-00.yasunyk.mongodb.net:27017,ac-eavgb6c-shard-00-01.yasunyk.mongodb.net:27017,ac-eavgb6c-shard-00-02.yasunyk.mongodb.net:27017/game_download_db?authSource=admin&replicaSet=atlas-9z3258-shard-0&readPreference=primary&ssl=true';

try {
  await mongoose.connect(uri);
  console.log('✅ 已连接 MongoDB');

  const hashed = await bcrypt.hash('admin123', 10);
  const res = await mongoose.connection.collection('admins').updateOne(
    { username: 'admin' },
    { $set: { password: hashed } }
  );
  console.log('✅ 密码已重置为 admin123');
  console.log('   matched:', res.matchedCount, 'modified:', res.modifiedCount);

  await mongoose.disconnect();
} catch (e) {
  console.error('❌ 失败:', e.message);
  process.exit(1);
}
