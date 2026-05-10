import express from 'express';
import PatchRequest from '../models/PatchRequest.js';
import { authMiddleware } from './adminAuth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    const patchRequests = await PatchRequest.find(query)
      .sort({ createdAt: -1 });
    res.json(patchRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const patchRequest = new PatchRequest(req.body);
    await patchRequest.save();
    res.status(201).json(patchRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const patchRequest = await PatchRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(patchRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;