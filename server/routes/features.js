import express from 'express';
import Feature from '../models/Feature.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const features = await Feature.find();
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const feature = new Feature(req.body);
  try {
    const savedFeature = await feature.save();
    res.status(201).json(savedFeature);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;