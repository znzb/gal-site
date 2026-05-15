import mongoose from 'mongoose';

const guideItemSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  content: { type: String, required: true }
});

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  order: { type: Number, default: 0 }
});

const toolGuideSchema = new mongoose.Schema({
  title: { type: String, default: '使用说明' },
  items: { type: [guideItemSchema], default: [] },
  tutorials: { type: [tutorialSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ToolGuide = mongoose.model('ToolGuide', toolGuideSchema);

export default ToolGuide;