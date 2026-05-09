import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true }
});

export default mongoose.model('Feature', featureSchema);