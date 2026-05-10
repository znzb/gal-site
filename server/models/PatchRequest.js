import mongoose from 'mongoose';

const patchRequestSchema = new mongoose.Schema({
  gameName: { type: String, required: true },
  userEmail: { type: String },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('PatchRequest', patchRequestSchema);