import express from 'express';
import Tool from '../models/Tool.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tools = await Tool.find().sort({ order: 1 });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const tool = new Tool({
      name: req.body.name,
      description: req.body.description,
      size: req.body.size,
      tags: req.body.tags || [],
      icon: req.body.icon || 'FileText',
      downloadUrl: req.body.downloadUrl,
      order: req.body.order || 0
    });
    const savedTool = await tool.save();
    res.status(201).json(savedTool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedTool = await Tool.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        size: req.body.size,
        tags: req.body.tags,
        icon: req.body.icon,
        downloadUrl: req.body.downloadUrl,
        order: req.body.order
      },
      { new: true }
    );
    res.json(updatedTool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Tool.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tool deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/download', async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    tool.downloads += 1;
    await tool.save();
    res.json({ downloads: tool.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;