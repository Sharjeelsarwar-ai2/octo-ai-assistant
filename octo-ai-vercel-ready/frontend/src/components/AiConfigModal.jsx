import React, { useState } from 'react';

export function AiConfigModal({ isOpen, onClose, systemStatus }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSample = `# backend/.env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/octo_ai_assistant`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSample).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-custom-backdrop" onClick={onClose}>
      <div className="modal-custom-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34, background: 'var(--accent-gradient)' }}
            >
              <i className="bi bi-cpu-fill text-white"></i>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">AI Provider Configuration</h5>
              <small className="text-muted">Connect OCTO AI to Ultra-Fast Groq LLM</small>
            </div>
          </div>
          <button className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
        </div>

        <div className="modal-body-custom">
          <div className="alert alert-info py-2 px-3 small d-flex align-items-start gap-2">
            <i className="bi bi-info-circle-fill mt-1 fs-6"></i>
            <div>
              <strong>Current Status:</strong>{' '}
              {systemStatus?.ai?.isRealAI ? (
                <span className="text-success fw-bold">
                  Connected to Real AI ({systemStatus?.ai?.provider} - {systemStatus?.ai?.model})
                </span>
              ) : (
                <span className="text-warning fw-bold">Demo Mode (Real AI Disconnected)</span>
              )}
              <div className="text-muted mt-1">{systemStatus?.ai?.message}</div>
            </div>
          </div>

          <div>
            <h6 className="fw-bold text-light mb-2">How to Connect Free Groq API (Recommended):</h6>
            <ol className="small text-secondary ps-3 mb-3">
              <li className="mb-1">
                Open Groq Cloud Console:{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-info text-decoration-none"
                >
                  https://console.groq.com/keys <i className="bi bi-box-arrow-up-right"></i>
                </a>
              </li>
              <li className="mb-1">Sign in with Google or GitHub and click <strong>"Create API Key"</strong>.</li>
              <li className="mb-1">
                Copy the key and paste it into <code>backend/.env</code> as <code>GROQ_API_KEY</code>.
              </li>
              <li>Restart the backend server. OCTO AI will automatically connect to Groq!</li>
            </ol>
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-bold">Configuration Snippet:</span>
              <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={handleCopy}>
                <i className={`bi ${copied ? 'bi-check2 text-success' : 'bi-clipboard'} me-1`}></i>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre
              className="p-2 rounded bg-dark text-light border border-secondary"
              style={{ fontSize: '0.8rem', overflowX: 'auto' }}
            >
              <code>{envSample}</code>
            </pre>
          </div>
        </div>

        <div className="modal-footer-custom">
          <button className="btn btn-primary px-4" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiConfigModal;
