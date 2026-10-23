import { Router } from 'express';
import config from '../config/env.js';
import { getDbStatus } from '../config/db.js';
import { verifyAiStatus } from '../services/ai/index.js';

const router = Router();

router.get('/status', async (req, res) => {
  const dbStatus = getDbStatus();
  const aiHealth = await verifyAiStatus();

  res.json({
    success: true,
    app: {
      name: 'OCTO AI',
      tagline: 'Intelligent assistance, always at your service.',
      owner: 'Sharjeel',
      personality: 'Professional, sharp, intelligent, supportive, and natural.',
      version: '2.0.0'
    },
    database: {
      connected: dbStatus.connected,
      type: dbStatus.type,
      storageNote: dbStatus.connected
        ? 'Connected to live MongoDB instance'
        : 'Running seamlessly in Zero-Cost Local Storage fallback mode'
    },
    ai: {
      connected: aiHealth.connected,
      isRealAI: aiHealth.isRealAI,
      status: aiHealth.status, // 'connected' | 'demo_mode' | 'error'
      provider: aiHealth.provider,
      model: aiHealth.model || (config.aiProvider === 'groq' ? config.groqModel : 'gemini-3.8-flash'),
      configuredProvider: config.aiProvider,
      hasApiKey: Boolean(config.aiProvider === 'groq' ? (config.groqApiKey || config.aiApiKey) : (config.geminiApiKey || config.aiApiKey)),
      message: aiHealth.message,
      isDemoMode: !aiHealth.isRealAI,
      envLocation: config.envFilePath ? 'Detected' : 'Default'
    },
    modes: [
      {
        id: 'assistant',
        name: 'Personal Assistant',
        icon: 'bi-stars',
        description: 'General questions, daily planning, everyday help & productivity.'
      },
      {
        id: 'coding',
        name: 'Coding Mentor',
        icon: 'bi-code-slash',
        description: 'Java, MERN Stack, React, Node, DSA, SQL & real-time debugging.'
      },
      {
        id: 'interview',
        name: 'Interview Coach',
        icon: 'bi-award',
        description: 'Mock interviews, technical evaluations & STAR behavioral practice.'
      },
      {
        id: 'english',
        name: 'English Practice',
        icon: 'bi-chat-heart',
        description: 'Conversational fluency, grammar corrections & professional vocabulary.'
      }
    ]
  });
});

export default router;
