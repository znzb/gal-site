import express from 'express';
import FAQ from '../models/FAQ.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const faq = new FAQ({
      question: req.body.question,
      answer: req.body.answer,
      order: req.body.order || 0
    });
    const savedFaq = await faq.save();
    res.status(201).json(savedFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedFaq = await FAQ.findByIdAndUpdate(
      req.params.id,
      {
        question: req.body.question,
        answer: req.body.answer,
        order: req.body.order
      },
      { new: true }
    );
    res.json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
