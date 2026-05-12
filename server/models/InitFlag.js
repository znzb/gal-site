import mongoose from 'mongoose';

const initFlagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  initialized: { type: Boolean, default: false },
  initializedAt: { type: Date, default: Date.now }
});

const InitFlag = mongoose.model('InitFlag', initFlagSchema);

export default InitFlag;