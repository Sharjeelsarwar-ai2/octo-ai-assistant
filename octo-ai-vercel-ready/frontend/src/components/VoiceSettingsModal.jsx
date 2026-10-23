import React from 'react';

export function VoiceSettingsModal({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onSelectVoice,
  pitch,
  onChangePitch,
  rate,
  onChangeRate,
  autoSpeak,
  onToggleAutoSpeak,
  onPreviewVoice,
  isSpeaking
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-custom-backdrop" onClick={onClose}>
      <div className="modal-custom-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 34,
                height: 34,
                background: 'var(--accent-gradient)'
              }}
            >
              <i className="bi bi-soundwave text-white"></i>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Voice & Speech Settings</h5>
              <small className="text-muted">OCTO AI's natural voice configuration</small>
            </div>
          </div>
          <button className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
        </div>

        <div className="modal-body-custom">
          {/* Auto Speak Toggle */}
          <div className="glass-panel p-3 d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold text-light d-flex align-items-center gap-2">
                <i className="bi bi-volume-up text-primary"></i>
                Auto-Speak Responses
              </div>
              <small className="text-muted">Automatically speak OCTO AI's replies aloud</small>
            </div>
            <div className="form-check form-switch fs-4 mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={autoSpeak}
                onChange={(e) => onToggleAutoSpeak(e.target.checked)}
              />
            </div>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="form-label text-light fw-semibold d-flex justify-content-between">
              <span>Select Speech Voice</span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                {voices.length} voices available
              </span>
            </label>
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedVoice?.voiceURI || ''}
              onChange={(e) => onSelectVoice(e.target.value)}
            >
              {voices.map((v) => {
                const isFemaleGuess =
                  v.name.toLowerCase().includes('female') ||
                  v.name.toLowerCase().includes('zira') ||
                  v.name.toLowerCase().includes('samantha') ||
                  v.name.toLowerCase().includes('jenny') ||
                  v.name.toLowerCase().includes('aria') ||
                  v.name.toLowerCase().includes('google us english');

                return (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}) {isFemaleGuess ? '✨ [Female Preferred]' : ''}
                  </option>
                );
              })}
            </select>
            <div className="form-text text-muted">
              Note: Voice quality depends on your operating system and browser synthesis engine. We automatically pick the closest available female English voice.
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-light fw-semibold mb-0">Voice Pitch</label>
              <span className="text-info small fw-bold">{pitch.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              className="form-range"
              min="0.7"
              max="1.4"
              step="0.05"
              value={pitch}
              onChange={(e) => onChangePitch(e.target.value)}
            />
            <div className="d-flex justify-content-between text-muted small">
              <span>Deeper</span>
              <span>Default (1.05)</span>
              <span>Sweeter / Higher</span>
            </div>
          </div>

          {/* Speed Slider */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-light fw-semibold mb-0">Speaking Speed</label>
              <span className="text-info small fw-bold">{rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              className="form-range"
              min="0.75"
              max="1.35"
              step="0.05"
              value={rate}
              onChange={(e) => onChangeRate(e.target.value)}
            />
            <div className="d-flex justify-content-between text-muted small">
              <span>Slower</span>
              <span>Normal (1.0)</span>
              <span>Faster</span>
            </div>
          </div>
        </div>

        <div className="modal-footer-custom">
          <button
            className="btn btn-outline-info d-flex align-items-center gap-2"
            onClick={onPreviewVoice}
            disabled={isSpeaking}
          >
            <i className={`bi ${isSpeaking ? 'bi-soundwave' : 'bi-play-circle-fill'}`}></i>
            {isSpeaking ? 'Playing Voice...' : 'Test Voice'}
          </button>
          <button className="btn btn-primary px-4" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceSettingsModal;
