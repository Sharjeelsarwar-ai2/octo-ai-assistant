import { isMongoConnected } from '../config/db.js';
import Conversation from '../models/Conversation.js';
import localStore from './storage/localStore.js';

export const conversationService = {
  async getAll() {
    if (isMongoConnected()) {
      try {
        const convos = await Conversation.find().sort({ updatedAt: -1 }).lean();
        return convos.map((c) => ({
          ...c,
          id: c.id || c._id.toString()
        }));
      } catch (err) {
        console.warn('MongoDB getAll failed, falling back to localStore:', err.message);
        if (process.env.NODE_ENV === 'production') throw err;
      }
    }
    return localStore.getAllConversations();
  },

  async getById(id) {
    if (isMongoConnected()) {
      try {
        const convo = await Conversation.findOne({ id }).lean();
        if (convo) return { ...convo, id: convo.id || convo._id.toString() };
      } catch (err) {
        console.warn('MongoDB getById failed, falling back to localStore:', err.message);
        if (process.env.NODE_ENV === 'production') throw err;
      }
    }
    return localStore.getConversationById(id);
  },

  async create({ id, title, mode, initialMessages }) {
    if (isMongoConnected()) {
      try {
        const convo = new Conversation({
          id: id || 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          title: title || 'New Conversation',
          mode: mode || 'assistant',
          messages: initialMessages || []
        });
        await convo.save();
        return convo.toObject();
      } catch (err) {
        console.warn('MongoDB create failed, falling back to localStore:', err.message);
        if (process.env.NODE_ENV === 'production') throw err;
      }
    }
    return localStore.createConversation({ id, title, mode, initialMessages });
  },

  async addMessage(convoId, message) {
    if (isMongoConnected()) {
      try {
        let convo = await Conversation.findOne({ id: convoId });
        const formattedMessage = {
          id: message.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          role: message.role,
          content: message.content,
          engine: message.engine || { provider: 'local', model: 'aara-local-v1', isFallback: true },
          timestamp: new Date()
        };

        if (!convo) {
          convo = new Conversation({
            id: convoId,
            title: message.role === 'user' ? message.content.slice(0, 35) + '...' : 'New Chat',
            mode: message.mode || 'assistant',
            messages: [formattedMessage]
          });
        } else {
          convo.messages.push(formattedMessage);
          if (convo.messages.length <= 2 && message.role === 'user') {
            convo.title = message.content.slice(0, 35) + (message.content.length > 35 ? '...' : '');
          }
        }
        await convo.save();
        return { conversation: convo.toObject(), message: formattedMessage };
      } catch (err) {
        console.warn('MongoDB addMessage failed, falling back to localStore:', err.message);
        if (process.env.NODE_ENV === 'production') throw err;
      }
    }
    return localStore.addMessage(convoId, message);
  },

  async delete(id) {
    if (isMongoConnected()) {
      try {
        await Conversation.deleteOne({ id });
        return true;
      } catch (err) {
        console.warn('MongoDB delete failed, falling back to localStore:', err.message);
        if (process.env.NODE_ENV === 'production') throw err;
      }
    }
    return localStore.deleteConversation(id);
  },

  async clearAll() {
    if (isMongoConnected()) {
      try {
        await Conversation.deleteMany({});
        return true;
      } catch (err) {
        console.warn('MongoDB clearAll failed, falling back to localStore:', err.message);
        if (process.env.NODE_ENV === 'production') throw err;
      }
    }
    return localStore.clearAll();
  }
};

export default conversationService;
