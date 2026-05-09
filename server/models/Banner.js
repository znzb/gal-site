import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true }
});

export default mongoose.model('Banner', bannerSchema);