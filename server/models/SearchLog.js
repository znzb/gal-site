import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  count: { type: Number, default: 1 },
  lastSearched: { type: Date, default: Date.now }
});

export default mongoose.model('SearchLog', searchLogSchema);