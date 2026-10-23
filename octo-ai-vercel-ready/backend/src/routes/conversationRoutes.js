import { Router } from 'express';
import conversationService from '../services/conversationService.js';

const router = Router();

// GET all conversations
router.get('/', async (req, res, next) => {
  try {
    const list = await conversationService.getAll();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// GET conversation by ID
router.get('/:id', async (req, res, next) => {
  try {
    const convo = await conversationService.getById(req.params.id);
    if (!convo) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    res.json({ success: true, data: convo });
  } catch (err) {
    next(err);
  }
});

// POST create new conversation
router.post('/', async (req, res, next) => {
  try {
    const { title, mode } = req.body;
    const convo = await conversationService.create({ title, mode });
    res.status(201).json({ success: true, data: convo });
  } catch (err) {
    next(err);
  }
});

// DELETE conversation by ID
router.delete('/:id', async (req, res, next) => {
  try {
    await conversationService.delete(req.params.id);
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    next(err);
  }
});

// DELETE clear all conversations
router.delete('/', async (req, res, next) => {
  try {
    await conversationService.clearAll();
    res.json({ success: true, message: 'All conversations cleared.' });
  } catch (err) {
    next(err);
  }
});

export default router;
