/**
 * Aara — Groq AI Provider
 *
 * Uses the official `groq-sdk` npm package.
 * Implements Groq Chat Completions with support for configured models (e.g. openai/gpt-oss-120b,
 * llama-3.3-70b-versatile, etc.), persona system instructions, and chat history.
 *
 * All secrets are kept on the backend. Never logs or leaks API keys.
 */
import Groq from 'groq-sdk';
import { getSystemPrompt } from './systemPrompts.js';

let _groqClient = null;
let _cachedKey = null;

/**
 * Returns a cached Groq client instance per API key.
 */
function getGroqClient(apiKey) {
  if (!_groqClient || _cachedKey !== apiKey) {
    _groqClient = new Groq({ apiKey });
    _cachedKey = apiKey;
  }
  return _groqClient;
}

/**
 * Formats Groq errors into user-friendly, safe messages without leaking secrets.
 */
function formatGroqError(err, modelName) {
  const msg = err?.message || String(err);
  const status = err?.status || err?.statusCode;

  if (status === 401 || msg.includes('401') || msg.includes('Invalid API Key') || msg.includes('unauthorized')) {
    return new Error('Invalid Groq API key (401 Unauthorized). Please check your GROQ_API_KEY in backend/.env.');
  }

  if (status === 429 || msg.includes('429') || msg.includes('rate_limit') || msg.includes('quota')) {
    return new Error('Groq rate limit exceeded (429). Please wait a few moments and try again.');
  }

  if (status === 404 || msg.includes('404') || msg.includes('model_not_found') || msg.includes('does not exist')) {
    return new Error(`Groq model "${modelName}" was not found or is not supported (404). Check GROQ_MODEL in backend/.env (e.g. openai/gpt-oss-120b, llama-3.3-70b-versatile).`);
  }

  if (msg.includes('ENOTFOUND') || msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('network')) {
    return new Error('Cannot connect to Groq API. Please check your network connection.');
  }

  return new Error(`Groq request failed: ${msg}`);
}

/**
 * Pings the Groq API with a minimal test message to verify the key and model.
 * Returns { ok: boolean, text?: string, error?: string }
 */
export async function pingGroq(apiKey, modelName = 'openai/gpt-oss-120b') {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return { ok: false, error: 'No Groq API key configured in backend/.env.' };
  }

  const selectedModel = modelName || 'openai/gpt-oss-120b';

  try {
    const groq = getGroqClient(apiKey.trim());
    const completion = await groq.chat.completions.create({
      model: selectedModel,
      messages: [{ role: 'user', content: 'Say "AARA_OK"' }],
      max_tokens: 10,
      temperature: 0.1
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    return { ok: true, text: reply || 'AARA_OK' };
  } catch (err) {
    const formatted = formatGroqError(err, selectedModel);
    return { ok: false, error: formatted.message };
  }
}

/**
 * Generates an assistant response using Groq Chat Completions.
 *
 * @param {object} opts
 * @param {string} opts.apiKey   - Groq API key (GROQ_API_KEY from .env)
 * @param {string} opts.model    - Model ID (GROQ_MODEL from .env)
 * @param {string} opts.message  - Current user query
 * @param {string} opts.mode     - Assistant mode: assistant | coding | interview | english
 * @param {Array}  opts.history  - Array of previous { role, content } messages
 */
export async function callGroq({ apiKey, model, message, mode = 'assistant', history = [] }) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('Groq API key is missing. Set GROQ_API_KEY in backend/.env.');
  }

  const selectedModel = model || 'openai/gpt-oss-120b';
  const systemPrompt = getSystemPrompt(mode);

  // Build message sequence for Groq
  const messages = [{ role: 'system', content: systemPrompt }];

  // Include recent conversation turns (up to 10)
  const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
  for (const turn of recentHistory) {
    if (!turn?.content || !turn?.role) continue;
    if (turn.role === 'user' || turn.role === 'assistant') {
      messages.push({
        role: turn.role,
        content: String(turn.content)
      });
    }
  }

  // Append latest user message
  messages.push({ role: 'user', content: String(message).trim() });

  try {
    const groq = getGroqClient(apiKey.trim());
    const completion = await groq.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 2048
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply || !reply.trim()) {
      throw new Error('Groq returned an empty response. Please try again.');
    }

    return {
      reply: reply.trim(),
      provider: 'groq',
      model: selectedModel,
      isRealAI: true,
      isFallback: false
    };
  } catch (err) {
    throw formatGroqError(err, selectedModel);
  }
}

export default { callGroq, pingGroq };
