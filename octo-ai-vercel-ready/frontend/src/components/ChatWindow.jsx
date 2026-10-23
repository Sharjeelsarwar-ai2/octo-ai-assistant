import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import GlowingOrb from './GlowingOrb.jsx';

export function ChatWindow({
  messages = [],
  isLoading,
  error,
  onRetry,
  onQuickPrompt,
  voiceState,
  onOrbClick,
  onStopSpeaking,
  onSpeakMessage,
  isSpeaking
}) {
  const bottomRef = useRef(null);
  const latestAssistantText = [...messages].reverse().find((message) => message.role === 'assistant')?.content || '';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      label: 'Identity Check',
      prompt: 'Who are you?',
      mode: 'assistant',
      icon: 'bi-patch-question-fill',
      color: 'text-primary'
    },
    {
      label: 'React useEffect Guide',
      prompt: 'Can you explain the React useEffect hook with a clean code example?',
      mode: 'coding',
      icon: 'bi-code-slash',
      color: 'text-info'
    },
    {
      label: 'Mock Interview Prep',
      prompt: 'Start a technical mock interview for a full-stack developer role.',
      mode: 'interview',
      icon: 'bi-award-fill',
      color: 'text-warning'
    },
    {
      label: 'English Practice',
      prompt: 'How are you today? Let us practice professional conversational English.',
      mode: 'english',
      icon: 'bi-chat-heart-fill',
      color: 'text-pink'
    }
  ];

  return (
    <div className="chat-viewport">
      {messages.length === 0 ? (
        <div className="welcome-hero">
          {/* Glowing Orb in Center */}
          <div className="hero-avatar-wrapper">
            <GlowingOrb
              state={voiceState}
              onClick={onOrbClick}
              onStopSpeaking={onStopSpeaking}
              speechText={latestAssistantText}
            />
          </div>

          <h2 className="fw-bold mb-1">
            Meet <span className="text-gradient">OCTO AI</span>
          </h2>
          <p className="text-secondary mb-3 fs-5">
            "Intelligent assistance, always at your service."
          </p>
          <div className="alert glass-panel py-2 px-3 d-inline-block text-light small mb-4">
            <i className="bi bi-person-badge-fill text-primary me-2"></i>
            Dedicated Personal AI Assistant for <strong>Sharjeel</strong>
          </div>

          {/* <p className="text-muted small" style={{ maxWidth: 540, margin: '0 auto 1.5rem auto' }}>
            Speak naturally with your microphone or type any question below. Aara speaks back with a sweet, natural female voice and guides you through coding, interviews, learning, and daily tasks.
          </p> */}

          {/* Quick Starter Cards */}
          <div className="mode-chip-grid">
            {quickPrompts.map((item, idx) => (
              <div
                key={idx}
                className="mode-chip-card"
                onClick={() => onQuickPrompt(item.prompt, item.mode)}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className={`bi ${item.icon} ${item.color} fs-5`}></i>
                  <span className="fw-semibold text-light small">{item.label}</span>
                </div>
                <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                  "{item.prompt}"
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Subtle Orb Header when chatting */}
          <div className="d-flex justify-content-center py-1">
            <GlowingOrb
              state={voiceState}
              onClick={onOrbClick}
              onStopSpeaking={onStopSpeaking}
              speechText={latestAssistantText}
            />
          </div>

          {/* Messages List */}
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              onSpeak={onSpeakMessage}
              onStop={onStopSpeaking}
              isSpeaking={isSpeaking}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="message-row ai">
              <div className="message-avatar ai">
                <i className="bi bi-stars"></i>
              </div>
              <div className="message-content-wrapper">
                <div className="message-bubble ai d-flex align-items-center gap-2">
                  <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
                  <span className="small text-secondary">OCTO AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner with Retry */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 max-w-860 mx-auto w-100">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <span className="small">{error}</span>
              </div>
              {onRetry && (
                <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
                  <i className="bi bi-arrow-clockwise me-1"></i>Retry
                </button>
              )}
            </div>
          )}

          <div ref={bottomRef} style={{ height: 1 }} />
        </>
      )}
    </div>
  );
}

export default ChatWindow;
