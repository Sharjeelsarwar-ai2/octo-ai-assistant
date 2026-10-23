import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');
const DATA_FILE = path.join(DATA_DIR, 'conversations.json');

// Ensure directory and file exist
async function ensureStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing localStore:', err);
  }
}

async function readAll() {
  await ensureStorage();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading localStore:', err);
    return [];
  }
}

async function writeAll(data) {
  await ensureStorage();
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing localStore:', err);
  }
}

export const localStore = {
  async getAllConversations() {
    const all = await readAll();
    // Sort descending by updatedAt
    return all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async getConversationById(id) {
    const all = await readAll();
    return all.find((c) => c.id === id) || null;
  },

  async createConversation({ id, title, mode, initialMessages = [] }) {
    const all = await readAll();
    const newConvo = {
      id: id || 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title || 'New Conversation',
      mode: mode || 'assistant',
      messages: initialMessages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    all.unshift(newConvo);
    await writeAll(all);
    return newConvo;
  },

  async updateConversation(id, updates) {
    const all = await readAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    all[idx] = {
      ...all[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeAll(all);
    return all[idx];
  },

  async addMessage(convoId, message) {
    const all = await readAll();
    let convo = all.find((c) => c.id === convoId);

    const formattedMessage = {
      id: message.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      role: message.role,
      content: message.content,
      engine: message.engine || { provider: 'local', model: 'aara-local-v1', isFallback: true },
      timestamp: message.timestamp || new Date().toISOString()
    };

    if (!convo) {
      convo = {
        id: convoId,
        title: message.role === 'user' ? message.content.slice(0, 35) + '...' : 'New Chat',
        mode: message.mode || 'assistant',
        messages: [formattedMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      all.unshift(convo);
    } else {
      convo.messages.push(formattedMessage);
      convo.updatedAt = new Date().toISOString();
      if (convo.messages.length <= 2 && message.role === 'user') {
        convo.title = message.content.slice(0, 35) + (message.content.length > 35 ? '...' : '');
      }
    }

    await writeAll(all);
    return { conversation: convo, message: formattedMessage };
  },

  async deleteConversation(id) {
    const all = await readAll();
    const filtered = all.filter((c) => c.id !== id);
    await writeAll(filtered);
    return true;
  },

  async clearAll() {
    await writeAll([]);
    return true;
  }
};

export default localStore;
