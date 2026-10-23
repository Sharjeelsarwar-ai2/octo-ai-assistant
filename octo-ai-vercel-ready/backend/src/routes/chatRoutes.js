import { Router } from 'express';
import { getAssistantResponse } from '../services/ai/index.js';
import conversationService from '../services/conversationService.js';

const router = Router();

const VALID_MODES = ['assistant', 'coding', 'interview', 'english'];

/**
 * POST /api/chat
 * Body: { message, mode, conversationId }
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, mode = 'assistant', conversationId } = req.body;

    // 1. Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required and cannot be empty.'
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum length of 5,000 characters.'
      });
    }

    const sanitizedMode = VALID_MODES.includes(mode) ? mode : 'assistant';
    const activeConversationId =
      conversationId || 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // 2. Fetch existing conversation for context history
    let existingConvo = await conversationService.getById(activeConversationId);
    const history = existingConvo?.messages || [];

    // 3. Save user message to persistent storage
    const userMsg = {
      role: 'user',
      content: message.trim(),
      mode: sanitizedMode,
      timestamp: new Date().toISOString()
    };
    await conversationService.addMessage(activeConversationId, userMsg);

    // 4. Generate AI response (Live LLM or honest demo mode)
    const aiResult = await getAssistantResponse({
      message: message.trim(),
      mode: sanitizedMode,
      history
    });

    // 5. Save assistant response
    const assistantMsg = {
      role: 'assistant',
      content: aiResult.reply,
      engine: {
        provider: aiResult.provider,
        model: aiResult.model,
        isRealAI: aiResult.isRealAI,
        isFallback: aiResult.isFallback
      },
      timestamp: new Date().toISOString()
    };
    const saveResult = await conversationService.addMessage(activeConversationId, assistantMsg);

    return res.status(200).json({
      success: true,
      conversationId: activeConversationId,
      reply: aiResult.reply,
      engine: {
        provider: aiResult.provider,
        model: aiResult.model,
        isRealAI: aiResult.isRealAI,
        isFallback: aiResult.isFallback,
        notice: aiResult.notice
      },
      mode: sanitizedMode,
      messageId: assistantMsg.id,
      conversation: saveResult?.conversation
    });
  } catch (err) {
    console.error('Chat route error:', err);
    next(err);
  }
});

export default router;
