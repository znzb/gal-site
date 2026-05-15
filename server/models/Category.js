import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 },
  bannerImage: { type: String, default: '' },
  description: { type: String, default: '' }
});

export default mongoose.model('Category', categorySchema);