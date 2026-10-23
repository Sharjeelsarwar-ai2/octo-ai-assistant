import React, { useRef, useEffect } from 'react';
import ModeSelector from './ModeSelector.jsx';

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  activeMode,
  onSelectMode,
  isListening,
  onToggleListening,
  interimTranscript,
  speechError,
  isSpeechSupported,
  isSpeaking,
  onStopSpeaking
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        {/* Mode Selector Bar */}
        <ModeSelector activeMode={activeMode} onSelectMode={onSelectMode} />

        {/* Live speech interim result banner */}
        {(isListening || interimTranscript) && (
          <div className="speech-live-banner">
            <span className="spinner-grow spinner-grow-sm text-danger" role="status"></span>
            <span className="fw-semibold">Listening:</span>
            <span className="text-light">{interimTranscript || 'Speak now...'}</span>
          </div>
        )}

        {/* Speech error message if permission blocked */}
        {speechError && (
          <div className="alert alert-warning py-1 px-3 mb-1 small d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{speechError}</span>
          </div>
        )}

        {/* Main Input Box */}
        <div className="input-box">
          {/* Interrupt / Stop Speaking Button */}
          {isSpeaking && (
            <button
              className="btn btn-outline-danger btn-sm rounded-circle p-2 flex-shrink-0"
              onClick={onStopSpeaking}
              title="Interrupt speech (Stop speaking)"
              style={{ width: 38, height: 38 }}
            >
              <i className="bi bi-stop-fill fs-5"></i>
            </button>
          )}

          {/* Microphone button */}
          <button
            type="button"
            className={`btn-mic ${isListening ? 'listening' : ''}`}
            onClick={onToggleListening}
            title={
              !isSpeechSupported
                ? 'Speech recognition not supported in this browser'
                : isListening
                ? 'Stop listening'
                : 'Click to speak to OCTO AI'
            }
            disabled={!isSpeechSupported}
          >
            <i className={`bi ${isListening ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : `Ask OCTO AI anything in ${activeMode} mode...`
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            type="button"
            className="btn-send"
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            title="Send message (Enter)"
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <i className="bi bi-arrow-up-short fs-3"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
