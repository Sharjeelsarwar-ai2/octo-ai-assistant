import React from 'react';

export function GlowingOrb({ state = 'idle', onClick, onStopSpeaking }) {
  // state can be: 'idle' | 'listening' | 'thinking' | 'speaking'

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Listening to you...';
      case 'thinking':
        return 'OCTO AI is thinking...';
      case 'speaking':
        return 'OCTO AI is speaking...';
      default:
        return 'Always at your service';
    }
  };

  const getBadgeClass = () => {
    switch (state) {
      case 'listening':
        return 'text-danger';
      case 'thinking':
        return 'text-warning';
      case 'speaking':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="orb-visualizer-container">
      <div
        className={`glowing-orb state-${state}`}
        onClick={onClick}
        title={
          state === 'speaking'
            ? 'Click to stop speech'
            : state === 'listening'
            ? 'Listening to your voice...'
            : 'Click to interact'
        }
      >
        {state === 'listening' ? (
          <i className="bi bi-mic-fill fs-3 text-white"></i>
        ) : state === 'speaking' ? (
          <i className="bi bi-volume-up-fill fs-3 text-white"></i>
        ) : state === 'thinking' ? (
          <i className="bi bi-cpu-fill fs-3 text-white"></i>
        ) : (
          <i className="bi bi-stars fs-3 text-white"></i>
        )}
      </div>

      <div className="d-flex align-items-center gap-2 mt-2">
        {/* Sound wave visualizer when speaking or listening */}
        <div className={`sound-wave ${state === 'speaking' || state === 'listening' ? 'active' : ''}`}>
          <div className="sound-wave-bar"></div>
          <div className="sound-wave-bar"></div>
          <div className="sound-wave-bar"></div>
          <div className="sound-wave-bar"></div>
          <div className="sound-wave-bar"></div>
        </div>

        <span className={`small fw-semibold ${getBadgeClass()}`}>
          {getStatusText()}
        </span>

        {state === 'speaking' && (
          <button
            className="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill ms-2"
            onClick={onStopSpeaking}
            title="Interrupt speech"
          >
            <i className="bi bi-stop-circle me-1"></i>Stop
          </button>
        )}
      </div>
    </div>
  );
}

export default GlowingOrb;
