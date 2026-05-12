import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, default: 'main' },
  size: { type: String },
  date: { type: String },
  language: { type: String, default: '简体中文' },
  platform: { type: String, default: 'Android' },
  dateDisplay: { type: String },
  authorName: { type: String },
  authorAvatar: { type: String },
  authorResources: { type: Number, default: 0 }
});

const commentSchema = new mongoose.Schema({
  id: { type: String },
  user: { type: String, required: true },
  avatar: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, default: 5 },
  date: { type: String },
  likes: { type: Number, default: 0 }
});

const gameSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cover: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  categories: { type: [String], default: [] },
  platforms: { type: [String], default: ['Android'] },
  size: { type: String, required: true },
  releaseDate: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  resources: { type: [resourceSchema], default: [] },
  comments: { type: [commentSchema], default: [] }
});

export default mongoose.model('Game', gameSchema);