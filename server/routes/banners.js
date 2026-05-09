import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const banner = new Banner(req.body);
  try {
    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;