/**
 * API client for Aara backend
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getAppStatus() {
  try {
    const res = await fetch(`${BASE_URL}/status`);
    if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend status unreachable:', err.message);
    return {
      success: false,
      database: { connected: false, type: 'Local Browser Fallback' },
      ai: { isZeroCostMode: true, configuredProvider: 'local' }
    };
  }
}

export async function sendChatMessage({ message, mode = 'assistant', conversationId }) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, conversationId })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return await res.json();
}

export async function fetchConversations() {
  try {
    const res = await fetch(`${BASE_URL}/conversations`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Could not fetch conversations from backend:', err.message);
    // Fallback to local storage if backend is unreachable
    try {
      const local = localStorage.getItem('aara_local_convos');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  }
}

export async function fetchConversationById(id) {
  try {
    const res = await fetch(`${BASE_URL}/conversations/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn(`Could not fetch conversation ${id}:`, err.message);
    return null;
  }
}

export async function deleteConversationApi(id) {
  try {
    const res = await fetch(`${BASE_URL}/conversations/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Delete conversation failed:', err.message);
    return false;
  }
}

export async function clearAllConversationsApi() {
  try {
    const res = await fetch(`${BASE_URL}/conversations`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Clear conversations failed:', err.message);
    return false;
  }
}

export default {
  getAppStatus,
  sendChatMessage,
  fetchConversations,
  fetchConversationById,
  deleteConversationApi,
  clearAllConversationsApi
};
