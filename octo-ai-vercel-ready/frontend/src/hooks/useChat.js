import { useState, useEffect, useCallback } from 'react';
import {
  sendChatMessage,
  fetchConversations,
  fetchConversationById,
  deleteConversationApi,
  clearAllConversationsApi
} from '../services/api.js';

export function useChat({ onAssistantReply }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState('assistant');

  // Load conversations on mount
  const loadConversations = useCallback(async () => {
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Select an existing conversation
  const selectConversation = useCallback(async (id) => {
    setError(null);
    try {
      setIsLoading(true);
      const convo = await fetchConversationById(id);
      if (convo) {
        setCurrentConversationId(convo.id);
        setMessages(convo.messages || []);
        if (convo.mode) {
          setActiveMode(convo.mode);
        }
      }
    } catch (err) {
      setError(`Failed to load conversation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start a new conversation
  const newConversation = useCallback(() => {
    const newId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setCurrentConversationId(newId);
    setMessages([]);
    setError(null);
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (text, overrideMode) => {
      const clean = text?.trim();
      if (!clean || isLoading) return;

      const modeToUse = overrideMode || activeMode;
      const convoId = currentConversationId || 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      if (!currentConversationId) {
        setCurrentConversationId(convoId);
      }

      // Optimistic user message
      const tempUserMsg = {
        id: 'msg_temp_' + Date.now(),
        role: 'user',
        content: clean,
        mode: modeToUse,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, tempUserMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage({
          message: clean,
          mode: modeToUse,
          conversationId: convoId
        });

        const assistantMsg = {
          id: response.messageId || 'msg_' + Date.now(),
          role: 'assistant',
          content: response.reply,
          engine: response.engine,
          timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, assistantMsg]);
        loadConversations(); // refresh list

        // Trigger TTS callback
        if (onAssistantReply) {
          onAssistantReply(response.reply);
        }
      } catch (err) {
        setError(`Error communicating with Aara: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeMode, currentConversationId, onAssistantReply, loadConversations]
  );

  // Retry last user message
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove any trailing failed assistant message
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[copy.length - 1]?.role === 'assistant') {
          copy.pop();
        }
        return copy;
      });
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // Delete conversation
  const deleteConversation = useCallback(
    async (id, e) => {
      if (e) e.stopPropagation();
      try {
        await deleteConversationApi(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (currentConversationId === id) {
          newConversation();
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    },
    [currentConversationId, newConversation]
  );

  // Clear all conversations
  const clearAllConversations = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all conversations?')) {
      try {
        await clearAllConversationsApi();
        setConversations([]);
        newConversation();
      } catch (err) {
        console.error('Clear all error:', err);
      }
    }
  }, [newConversation]);

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    error,
    activeMode,
    setActiveMode,
    sendMessage,
    retryLastMessage,
    selectConversation,
    newConversation,
    deleteConversation,
    clearAllConversations
  };
}

export default useChat;
