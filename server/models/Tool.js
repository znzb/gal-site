import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  size: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  icon: { type: String, default: 'FileText' },
  downloadUrl: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Tool = mongoose.model('Tool', toolSchema);

export default Tool;