import config from '../../config/env.js';
import { generateLocalReply } from './localFallbackEngine.js';
import { callGemini, pingGemini } from './geminiProvider.js';
import { callGroq, pingGroq } from './groqProvider.js';
import { callOpenAI } from './openAiProvider.js';
import { AARA_CANONICAL_IDENTITY_REPLY } from './systemPrompts.js';

// Status tracking for provider connectivity
let lastVerifiedProvider = null;
let lastVerificationTime = null;
let lastProviderError = null;
let isRealAiVerified = false;

// Check if message is strictly asking for identity
function isStrictIdentityQuery(msg = '') {
  const norm = msg.toLowerCase().trim().replace(/[^\w\s]/gi, '');
  return (
    norm === 'who are you' ||
    norm === 'what is your name' ||
    norm === 'who do you assist' ||
    norm === 'who are you and what do you do' ||
    norm === 'who are you aara'
  );
}

/**
 * Verify whether configured provider is live and authenticated
 * Never claims real AI is connected unless a real request succeeds.
 */
export async function verifyAiStatus() {
  const provider = config.aiProvider;

  // Groq verification
  if (provider === 'groq') {
    const apiKey = config.groqApiKey || config.aiApiKey;
    const model = config.groqModel || 'openai/gpt-oss-120b';

    if (!apiKey) {
      isRealAiVerified = false;
      lastProviderError = 'GROQ_API_KEY is missing in backend/.env';
      return {
        connected: false,
        isRealAI: false,
        status: 'demo_mode',
        provider: 'groq',
        model,
        message: 'Groq API key not found. Add GROQ_API_KEY in backend/.env to connect real AI.'
      };
    }

    const ping = await pingGroq(apiKey, model);
    if (ping.ok) {
      isRealAiVerified = true;
      lastVerifiedProvider = 'groq';
      lastVerificationTime = new Date().toISOString();
      lastProviderError = null;
      return {
        connected: true,
        isRealAI: true,
        status: 'connected',
        provider: 'groq',
        model,
        message: `Connected to Groq API (${model}).`
      };
    } else {
      isRealAiVerified = false;
      lastProviderError = ping.error;
      return {
        connected: false,
        isRealAI: false,
        status: 'error',
        provider: 'groq',
        model,
        message: ping.error
      };
    }
  }

  // Gemini verification
  if (provider === 'gemini') {
    const apiKey = config.geminiApiKey || config.aiApiKey;
    const model = config.geminiModel || 'gemini-3.8-flash';

    if (!apiKey) {
      isRealAiVerified = false;
      lastProviderError = 'No Gemini API key configured in backend/.env';
      return {
        connected: false,
        isRealAI: false,
        status: 'demo_mode',
        provider: 'gemini',
        model,
        message: 'Running in offline demo mode. Set AI_API_KEY in backend/.env to connect Gemini.'
      };
    }

    const ping = await pingGemini(apiKey, model);
    if (ping.ok) {
      isRealAiVerified = true;
      lastVerifiedProvider = 'gemini';
      lastVerificationTime = new Date().toISOString();
      lastProviderError = null;
      return {
        connected: true,
        isRealAI: true,
        status: 'connected',
        provider: 'gemini',
        model,
        message: 'Connected to Google Gemini API.'
      };
    } else {
      isRealAiVerified = false;
      lastProviderError = ping.error;
      return {
        connected: false,
        isRealAI: false,
        status: 'error',
        provider: 'gemini',
        model,
        message: `Gemini verification failed: ${ping.error}`
      };
    }
  }

  // OpenAI / other
  const apiKey = config.aiApiKey;
  if (!apiKey || provider === 'demo' || provider === 'local') {
    isRealAiVerified = false;
    return {
      connected: false,
      isRealAI: false,
      status: 'demo_mode',
      provider: 'demo',
      model: 'local-demo',
      message: 'Running in offline demo mode. Set AI_PROVIDER=groq and GROQ_API_KEY in backend/.env.'
    };
  }

  return {
    connected: true,
    isRealAI: true,
    status: 'connected',
    provider,
    model: config.aiModel || 'default',
    message: `Provider ${provider} configured.`
  };
}

/**
 * Main entry point for generating assistant responses
 */
export async function getAssistantResponse({ message, mode = 'assistant', history = [] }) {
  // 1. Strict Identity Query check
  if (isStrictIdentityQuery(message)) {
    return {
      reply: `${AARA_CANONICAL_IDENTITY_REPLY}\n\nI'm ready in **${getModeDisplayName(mode)}** mode. How would you like to start?`,
      provider: 'canonical-identity',
      model: 'aara-core-persona',
      isRealAI: true,
      isFallback: false
    };
  }

  const provider = config.aiProvider;

  // 2. If provider is explicitly demo or local
  if (provider === 'demo' || provider === 'local') {
    const reply = generateLocalReply({ message, mode, history });
    return {
      reply,
      provider: 'demo',
      model: 'offline-demo-v1',
      isRealAI: false,
      isFallback: true,
      notice: 'Demo Mode: Real AI not connected. Add GROQ_API_KEY in backend/.env to enable live LLM answers.'
    };
  }

  // 3. Groq Provider
  if (provider === 'groq') {
    const apiKey = config.groqApiKey || config.aiApiKey;
    const model = config.groqModel || 'openai/gpt-oss-120b';

    if (!apiKey) {
      return {
        reply: '⚠️ **Groq API Key Missing**\n\nPlease add GROQ_API_KEY=your_key in backend/.env and restart the server.',
        provider: 'groq',
        model,
        isRealAI: false,
        isFallback: false,
        error: 'GROQ_API_KEY is not set in backend/.env'
      };
    }

    try {
      const result = await callGroq({
        apiKey,
        model,
        message,
        mode,
        history
      });

      isRealAiVerified = true;
      lastVerifiedProvider = 'groq';
      lastVerificationTime = new Date().toISOString();
      lastProviderError = null;

      return {
        reply: result.reply,
        provider: 'groq',
        model: result.model,
        isRealAI: true,
        isFallback: false
      };
    } catch (error) {
      console.error('Groq API Error:', error.message);
      lastProviderError = error.message;

      // DO NOT silently fall back to a fake demo template when Groq fails
      return {
        reply: `⚠️ **Groq AI Request Failed**\n\n${error.message}\n\nPlease check your GROQ_API_KEY and GROQ_MODEL in backend/.env.`,
        provider: 'groq',
        model,
        isRealAI: false,
        isFallback: false,
        error: error.message
      };
    }
  }

  // 4. Gemini Provider
  if (provider === 'gemini') {
    const apiKey = config.geminiApiKey || config.aiApiKey;
    const model = config.geminiModel || 'gemini-3.8-flash';

    if (!apiKey) {
      return {
        reply: '⚠️ **Gemini API Key Missing**\n\nPlease add AI_API_KEY=your_key in backend/.env.',
        provider: 'gemini',
        model,
        isRealAI: false,
        isFallback: false,
        error: 'AI_API_KEY is not set in backend/.env'
      };
    }

    try {
      const result = await callGemini({
        apiKey,
        model,
        message,
        mode,
        history
      });

      isRealAiVerified = true;
      lastVerifiedProvider = 'gemini';
      lastVerificationTime = new Date().toISOString();
      lastProviderError = null;

      return {
        reply: result.reply,
        provider: result.provider,
        model: result.model,
        isRealAI: true,
        isFallback: false
      };
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      lastProviderError = error.message;

      return {
        reply: `⚠️ **Gemini API Request Failed**\n\n${error.message}\n\nTip: You can switch to Groq by setting AI_PROVIDER=groq and GROQ_API_KEY in backend/.env.`,
        provider: 'gemini',
        model,
        isRealAI: false,
        isFallback: false,
        error: error.message
      };
    }
  }

  // 5. OpenAI or custom endpoints
  if (provider === 'openai' || provider === 'custom') {
    try {
      const result = await callOpenAI({
        apiKey: config.aiApiKey,
        baseUrl: config.aiBaseUrl,
        model: config.aiModel || 'gpt-4o-mini',
        message,
        mode,
        history
      });
      return {
        reply: result.reply,
        provider: result.provider,
        model: result.model,
        isRealAI: true,
        isFallback: false
      };
    } catch (error) {
      return {
        reply: `⚠️ **OpenAI API Request Failed**\n\n${error.message}`,
        provider: 'openai',
        model: config.aiModel,
        isRealAI: false,
        isFallback: false,
        error: error.message
      };
    }
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

function getModeDisplayName(mode) {
  switch (mode) {
    case 'coding':
      return 'Coding Mentor';
    case 'interview':
      return 'Interview Coach';
    case 'english':
      return 'English Practice';
    default:
      return 'Personal Assistant';
  }
}

export default {
  getAssistantResponse,
  verifyAiStatus
};
