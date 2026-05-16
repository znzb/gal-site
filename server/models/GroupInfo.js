import mongoose from 'mongoose';

const groupInfoSchema = new mongoose.Schema({
  id: { type: String, default: 'group-info', unique: true },
  groupNumber: { type: String, default: '123456789' },
  groupName: { type: String, default: 'GalGame资源共享' },
  qrCode: { type: String, default: '' },
  description: { type: String, default: '欢迎加入我们的QQ群！' },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('GroupInfo', groupInfoSchema);
