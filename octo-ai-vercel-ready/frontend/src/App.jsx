import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ChatInput from './components/ChatInput.jsx';
import VoiceSettingsModal from './components/VoiceSettingsModal.jsx';
import AiConfigModal from './components/AiConfigModal.jsx';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis.js';
import { useChat } from './hooks/useChat.js';
import { getAppStatus } from './services/api.js';

export function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aara_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aara_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // System Status
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    getAppStatus().then((res) => {
      setSystemStatus(res);
    });
  }, []);

  // UI Modals & Drawers
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Input state
  const [inputText, setInputText] = useState('');

  // Speech Synthesis Hook
  const {
    voices,
    selectedVoice,
    isSpeaking,
    isSupported: isTtsSupported,
    autoSpeak,
    pitch,
    rate,
    speak,
    stop: stopSpeaking,
    previewVoice,
    toggleAutoSpeak,
    chooseVoice,
    updatePitch,
    updateRate
  } = useSpeechSynthesis();

  // Assistant reply callback -> auto-speak if enabled
  const handleAssistantReply = useCallback(
    (replyText) => {
      if (autoSpeak && replyText) {
        speak(replyText);
      }
    },
    [autoSpeak, speak]
  );

  // Chat Hook
  const {
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
  } = useChat({ onAssistantReply: handleAssistantReply });

  // Speech Recognition Hook (STT)
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: isSttSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // When speech recognition produces final text, send or put into input
  const handleVoiceInput = useCallback(
    (spokenText) => {
      if (spokenText && spokenText.trim()) {
        setInputText(spokenText.trim());
        // Automatically send the spoken message
        sendMessage(spokenText.trim());
        resetTranscript();
      }
    },
    [sendMessage, resetTranscript]
  );

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      // If OCTO AI is speaking, stop speaking first
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening(handleVoiceInput);
    }
  };

  // Send message from input
  const handleSendMessage = () => {
    if (!inputText.trim() || isLoading) return;
    if (isSpeaking) {
      stopSpeaking();
    }
    const text = inputText.trim();
    setInputText('');
    sendMessage(text);
  };

  // Quick prompt handler
  const handleQuickPrompt = (promptText, mode) => {
    if (mode) {
      setActiveMode(mode);
    }
    if (isSpeaking) {
      stopSpeaking();
    }
    sendMessage(promptText, mode);
  };

  // Calculate overall voice state for the glowing orb
  let voiceState = 'idle';
  if (isListening) {
    voiceState = 'listening';
  } else if (isLoading) {
    voiceState = 'thinking';
  } else if (isSpeaking) {
    voiceState = 'speaking';
  }

  // Glowing orb click action
  const handleOrbClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (isListening) {
      stopListening();
    } else {
      toggleListening();
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={newConversation}
        onDeleteConversation={deleteConversation}
        onClearAll={clearAllConversations}
      />

      {/* Main Content Area */}
      <div className="chat-main">
        {/* Top Navbar */}
        <Navbar
          status={systemStatus}
          selectedVoice={selectedVoice}
          onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
          onOpenConfigHelp={() => setIsAiConfigModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Message Feed / Welcome Screen */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          onRetry={retryLastMessage}
          onQuickPrompt={handleQuickPrompt}
          voiceState={voiceState}
          onOrbClick={handleOrbClick}
          onStopSpeaking={stopSpeaking}
          onSpeakMessage={speak}
          isSpeaking={isSpeaking}
        />

        {/* Bottom Input Area */}
        <ChatInput
          input={inputText}
          setInput={setInputText}
          onSend={handleSendMessage}
          isLoading={isLoading}
          activeMode={activeMode}
          onSelectMode={setActiveMode}
          isListening={isListening}
          onToggleListening={toggleListening}
          interimTranscript={interimTranscript}
          speechError={speechError}
          isSpeechSupported={isSttSupported}
          isSpeaking={isSpeaking}
          onStopSpeaking={stopSpeaking}
        />
      </div>

      {/* Voice & Speech Synthesis Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        onSelectVoice={chooseVoice}
        pitch={pitch}
        onChangePitch={updatePitch}
        rate={rate}
        onChangeRate={updateRate}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={toggleAutoSpeak}
        onPreviewVoice={previewVoice}
        isSpeaking={isSpeaking}
      />

      {/* Real AI Provider Configuration Modal */}
      <AiConfigModal
        isOpen={isAiConfigModalOpen}
        onClose={() => setIsAiConfigModalOpen(false)}
        systemStatus={systemStatus}
      />
    </div>
  );
}

export default App;
