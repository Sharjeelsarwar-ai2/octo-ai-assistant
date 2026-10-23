import React, { useState } from 'react';

export function CodeBlock({ code, language = 'text' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-container">
      <div className="code-header">
        <span className="text-uppercase fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
          {language}
        </span>
        <button
          className="btn-action-icon text-muted d-flex align-items-center gap-1"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? (
            <>
              <i className="bi bi-check2 text-success"></i>
              <span className="text-success" style={{ fontSize: '0.75rem' }}>
                Copied!
              </span>
            </>
          ) : (
            <>
              <i className="bi bi-clipboard"></i>
              <span style={{ fontSize: '0.75rem' }}>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="code-body">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default CodeBlock;
