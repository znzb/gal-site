import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cover: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  size: { type: String, required: true },
  releaseDate: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  tags: { type: [String], default: [] }
});

export default mongoose.model('Game', gameSchema);