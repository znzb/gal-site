import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const games = await Game.find({ category: req.params.category });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const game = new Game(req.body);
  try {
    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedGame = await Game.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedGame) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedGame = await Game.findOneAndDelete({ id: req.params.id });
    if (!deletedGame) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    res.json({ message: '游戏已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/download', async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) {
      return res.status(404).json({ message: '游戏不存在' });
    }
    game.downloads += 1;
    await game.save();
    res.json({ downloads: game.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;