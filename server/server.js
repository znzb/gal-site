import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import gamesRouter from './routes/games.js';
import categoriesRouter from './routes/categories.js';
import featuresRouter from './routes/features.js';
import bannersRouter from './routes/banners.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/games', gamesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/features', featuresRouter);
app.use('/api/banners', bannersRouter);

app.get('/', (req, res) => {
  res.json({ message: '游戏下载网站 API 服务运行中' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });