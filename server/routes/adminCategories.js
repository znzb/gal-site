import express from 'express';
import Category from '../models/Category.js';
import Game from '../models/Game.js';
import { authMiddleware } from './adminAuth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const maxCategory = await Category.findOne().sort({ id: -1 });
    const newId = maxCategory ? String(parseInt(maxCategory.id) + 1) : '1';
    
    const category = new Category({
      ...req.body,
      id: newId
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const ObjectId = require('mongoose').Types.ObjectId;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;
    
    let category;
    
    try {
      const objectId = new ObjectId(req.params.id);
      category = await Category.findOneAndUpdate({ _id: objectId }, updateData, { new: true, runValidators: false });
    } catch (e) {
    }
    
    if (!category) {
      category = await Category.findOneAndUpdate({ id: req.params.id }, updateData, { new: true, runValidators: false });
    }
    
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const ObjectId = require('mongoose').Types.ObjectId;
    const isObjectId = ObjectId.isValid(req.params.id);
    
    let category;
    
    if (isObjectId) {
      category = await Category.findOneAndDelete(
        { $or: [{ id: req.params.id }, { _id: new ObjectId(req.params.id) }] }
      );
    } else {
      category = await Category.findOneAndDelete({ id: req.params.id });
      if (!category) {
        category = await Category.findOneAndDelete({ _id: req.params.id });
      }
    }
    
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/merge-to-gal', authMiddleware, async (req, res) => {
  try {
    const galCategory = await Category.findOne({ name: 'Gal游戏' });
    if (!galCategory) {
      return res.status(404).json({ error: 'Gal游戏分类不存在，请先创建' });
    }

    const migratedGames = [];
    const sourceCategories = ['安卓直装', 'kr资源'];

    for (const categoryName of sourceCategories) {
      const updated = await Game.updateMany(
        { category: categoryName },
        { category: 'Gal游戏' }
      );
      if (updated.modifiedCount > 0) {
        migratedGames.push({ from: categoryName, count: updated.modifiedCount });
      }
    }

    res.json({
      message: '游戏分类迁移完成',
      migrated: migratedGames
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;