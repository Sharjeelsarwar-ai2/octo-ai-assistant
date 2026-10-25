import React, { useEffect, useState } from 'react';

const MASCOT_IMAGES = {
  idle: '/octo-mascot.png',
  listening: '/octo-mascot-listening.png',
  thinking: '/octo-mascot-thinking.png',
  speaking: '/octo-mascot-talking.png',
  sleeping: '/octo-mascot-sleeping.png'
};

export function GlowingOrb({ state = 'idle', onClick, onStopSpeaking, speechText = '' }) {
  // state can be: 'idle' | 'listening' | 'thinking' | 'speaking'
  // If every mascot file fails to load, never leave a broken-image icon
  // blinking under the float/bob animations: fall back to an emoji mascot.
  const [imageFailed, setImageFailed] = useState(false);
  const [triedIdle, setTriedIdle] = useState(false);
  useEffect(() => {
    setTriedIdle(false);
    setImageFailed(false);
  }, [state]);

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
        {(state === 'speaking' || state === 'sleeping') && (
          <div className="speech-bubble" role="status" aria-live="polite">
            {state === 'sleeping' ? (
              <span aria-label="Sleeping">Zzz...</span>
            ) : (
              <>
                <i className="bi bi-soundwave" aria-hidden="true"></i>
                <span>{speechText ? `${speechText.slice(0, 92)}${speechText.length > 92 ? '…' : ''}` : 'Speaking…'}</span>
              </>
            )}
          </div>
        )}
        {imageFailed ? (
          <div className="octo-mascot d-flex align-items-center justify-content-center" style={{ fontSize: 84 }} role="img" aria-label={`OCTO AI ${state} expression`}>
            🐙
          </div>
        ) : (
          <img
            key={state}
            src={MASCOT_IMAGES[state] || MASCOT_IMAGES.idle}
            alt={`OCTO AI ${state} expression`}
            className="octo-mascot"
            draggable="false"
            onError={(event) => {
              if (!triedIdle && event.currentTarget.src !== MASCOT_IMAGES.idle) {
                setTriedIdle(true);
                event.currentTarget.src = MASCOT_IMAGES.idle;
              } else {
                setImageFailed(true);
              }
            }}
          />
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
