import React from 'react';

export function StatusBadge({ status, selectedVoice, onOpenConfigHelp }) {
  const dbConnected = status?.database?.connected;
  const isRealAI = Boolean(status?.ai?.isRealAI && status?.ai?.connected);
  const isError = status?.ai?.status === 'error';
  const provider = status?.ai?.provider || 'demo';
  const model = status?.ai?.model || '';

  return (
    <div className="d-none d-md-flex align-items-center gap-2">
      {/* Real AI vs Demo Status Badge */}
      {isRealAI ? (
        <span
          className="badge d-flex align-items-center gap-1 py-1 px-2 bg-success-subtle text-success border border-success"
          title={`Real LLM Active: ${provider.toUpperCase()} (${model})`}
          style={{ cursor: 'default' }}
        >
          <span className="spinner-grow spinner-grow-sm text-success" style={{ width: 8, height: 8 }} role="status"></span>
          <i className="bi bi-stars"></i>
          <span>Real AI: {provider === 'gemini' ? 'Gemini' : provider}</span>
        </span>
      ) : isError ? (
        <span
          className="badge d-flex align-items-center gap-1 py-1 px-2 bg-danger-subtle text-danger border border-danger-subtle"
          title={status?.ai?.message || 'AI Connection Error. Check your API key in backend/.env'}
          onClick={onOpenConfigHelp}
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>AI Connection Error</span>
        </span>
      ) : (
        <span
          className="badge d-flex align-items-center gap-1 py-1 px-2 bg-warning-subtle text-warning border border-warning-subtle"
          title={status?.ai?.message || 'Real AI is not connected. Add AI_API_KEY in backend/.env to connect Gemini.'}
          onClick={onOpenConfigHelp}
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-info-circle-fill"></i>
          <span>Demo Mode (Real AI Disconnected)</span>
        </span>
      )}

      {/* Database Badge */}
      <span
        className={`badge d-flex align-items-center gap-1 py-1 px-2 ${
          dbConnected
            ? 'bg-info-subtle text-info border border-info-subtle'
            : 'bg-secondary-subtle text-secondary border border-secondary-subtle'
        }`}
        title={dbConnected ? 'MongoDB Connected' : 'Running with local JSON file persistence'}
      >
        <i className={`bi ${dbConnected ? 'bi-database-check' : 'bi-hdd-fill'}`}></i>
        <span>{dbConnected ? 'MongoDB' : 'Local Storage'}</span>
      </span>

      {/* Voice Badge */}
      {selectedVoice && (
        <span
          className="badge bg-dark-subtle text-light border border-secondary-subtle d-none d-lg-flex align-items-center gap-1 py-1 px-2"
          title={`Active Voice: ${selectedVoice.name} (${selectedVoice.lang})`}
        >
          <i className="bi bi-mic-fill text-pink"></i>
          <span>{selectedVoice.name.slice(0, 14)}...</span>
        </span>
      )}
    </div>
  );
}

export default StatusBadge;
