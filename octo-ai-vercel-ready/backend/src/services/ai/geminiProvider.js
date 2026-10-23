/**
 * Aara — Gemini AI Provider
 *
 * Uses the official @google/genai SDK with the new Interactions API
 * that supports authorization keys (AQ. prefix) issued by Google AI Studio
 * since May 28, 2026.
 *
 * Endpoint: POST /v1beta/interactions  (NOT the old GenerateContent v1beta endpoint)
 * Reference: https://ai.google.dev/gemini-api/docs/api-key
 *            https://ai.google.dev/gemini-api/docs/migrate
 */
import { GoogleGenAI } from '@google/genai';
import { getSystemPrompt } from './systemPrompts.js';

// Cache client per API key
let _client = null;
let _clientKey = null;

function getClient(apiKey) {
  if (!_client || _clientKey !== apiKey) {
    _client = new GoogleGenAI({ apiKey });
    _clientKey = apiKey;
  }
  return _client;
}

/**
 * Ping Gemini using the Interactions API to verify AQ. key + model.
 * Returns { ok, text?, error? }
 */
export async function pingGemini(apiKey, modelName = 'gemini-3.8-flash') {
  if (!apiKey) return { ok: false, error: 'No API key configured.' };
  try {
    const ai = getClient(apiKey);
    // Use Interactions API — the endpoint that accepts AQ. authorization keys
    const interaction = await ai.interactions.create({
      model: modelName,
      input: 'ping',
      config: { maxOutputTokens: 5 }
    });
    const text = interaction.outputText || 'pong';
    return { ok: true, text };
  } catch (err) {
    // Fall back to models.generateContent for standard AIza. keys
    try {
      const ai2 = getClient(apiKey);
      const response = await ai2.models.generateContent({
        model: modelName,
        contents: 'ping',
        config: { maxOutputTokens: 5 }
      });
      return { ok: true, text: response.text || 'pong' };
    } catch (err2) {
      return { ok: false, error: err2.message || err.message };
    }
  }
}

/**
 * Generate a full chat response via Gemini.
 * Tries the Interactions API first (required for AQ. auth keys),
 * then falls back to models.generateContent (for legacy AIza. keys).
 *
 * @param {string} opts.apiKey   - The AI_API_KEY from backend/.env
 * @param {string} opts.model    - Model ID, e.g. "gemini-3.8-flash"
 * @param {string} opts.message  - Current user message
 * @param {string} opts.mode     - assistant | coding | interview | english
 * @param {Array}  opts.history  - Previous { role, content } messages
 */
export async function callGemini({ apiKey, model, message, mode = 'assistant', history = [] }) {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in backend/.env.');
  }

  const selectedModel = model || 'gemini-3.8-flash';
  const ai = getClient(apiKey);
  const systemInstruction = getSystemPrompt(mode);

  // Build conversation context as a plain text prefix for the Interactions API
  const recentHistory = history.slice(-10);
  const contextLines = [];
  for (const msg of recentHistory) {
    if (!msg.content || !msg.role) continue;
    const label = msg.role === 'user' ? 'User' : 'Aara';
    contextLines.push(`${label}: ${msg.content}`);
  }

  // For Interactions API: combine system instruction + history + message into a single input
  const fullInput = contextLines.length > 0
    ? `${contextLines.join('\n')}\nUser: ${message}`
    : message;

  let lastError = null;

  // --- Strategy 1: Interactions API (supports AQ. auth keys) ---
  try {
    const interaction = await ai.interactions.create({
      model: selectedModel,
      system: systemInstruction,
      input: fullInput,
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    });

    const reply = interaction.outputText;
    if (!reply || !reply.trim()) {
      throw new Error('Gemini returned an empty response.');
    }

    return {
      reply: reply.trim(),
      provider: 'gemini',
      model: selectedModel,
      isRealAI: true,
      isFallback: false
    };
  } catch (interactionError) {
    lastError = interactionError;
    // If it's explicitly an auth error, don't try the other strategy
    const msg = interactionError.message || '';
    if (msg.includes('UNAUTHENTICATED') || msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
        msg.includes('API key not valid') || msg.includes('401')) {
      throw buildFriendlyError(interactionError, selectedModel);
    }
  }

  // --- Strategy 2: models.generateContent (legacy AIza. standard keys) ---
  try {
    const contents = [];
    for (const msg of recentHistory) {
      if (!msg.content || !msg.role) continue;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    });

    const reply = response.text;
    if (!reply || !reply.trim()) {
      throw new Error('Gemini returned an empty response.');
    }

    return {
      reply: reply.trim(),
      provider: 'gemini',
      model: selectedModel,
      isRealAI: true,
      isFallback: false
    };
  } catch (generateError) {
    throw buildFriendlyError(generateError || lastError, selectedModel);
  }
}

function buildFriendlyError(error, model) {
  const msg = (error && error.message) ? error.message : String(error);

  if (msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') || msg.includes('UNAUTHENTICATED') || msg.includes('401')) {
    return new Error(
      'Gemini auth failed (401 UNAUTHENTICATED / ACCESS_TOKEN_TYPE_UNSUPPORTED). ' +
      'Your AQ. key is valid in format but may be from a project where the Generative Language API is not enabled. ' +
      'Fix: Go to https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com → ' +
      'select your project → click Enable. Then retry.'
    );
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.includes('quota')) {
    return new Error('Gemini quota exceeded. Wait 60 seconds and try again.');
  }
  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('Service Unavailable')) {
    return new Error('Gemini servers are temporarily unavailable (503). Please retry in a few seconds.');
  }
  if (msg.includes('404') || msg.includes('no longer available') || msg.includes('Not Found')) {
    return new Error(`Model "${model}" not found. Check https://ai.google.dev/gemini-api/docs/models for valid IDs.`);
  }
  if (msg.includes('ENOTFOUND') || msg.includes('fetch failed')) {
    return new Error('Cannot reach Google Gemini API. Check your internet connection.');
  }
  return error;
}

export default { callGemini, pingGemini };
