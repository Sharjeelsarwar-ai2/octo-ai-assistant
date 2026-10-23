import { getSystemPrompt } from './systemPrompts.js';

export async function callOpenAI({ apiKey, baseUrl, model, message, mode, history = [] }) {
  const selectedModel = model || 'gpt-4o-mini';
  const endpoint = (baseUrl ? baseUrl.replace(/\/+$/, '') : 'https://api.openai.com/v1') + '/chat/completions';

  const systemPrompt = getSystemPrompt(mode);
  const messages = [{ role: 'system', content: systemPrompt }];

  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: message });

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI-compatible API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || '';

  if (!reply) {
    throw new Error('Empty response received from OpenAI provider');
  }

  return {
    reply,
    provider: baseUrl ? 'custom-openai' : 'openai',
    model: selectedModel,
    isFallback: false
  };
}

export default callOpenAI;
