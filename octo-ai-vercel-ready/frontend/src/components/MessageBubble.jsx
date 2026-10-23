import React, { useState } from 'react';
import CodeBlock from './CodeBlock.jsx';

// Simple parser for markdown-like text with code blocks
function renderFormattedContent(content = '') {
  if (!content) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(
        <div key={`text-${lastIndex}`} className="content-text-segment">
          {renderTextParagraphs(textBefore)}
        </div>
      );
    }

    const language = match[1] || 'javascript';
    const code = match[2];
    elements.push(<CodeBlock key={`code-${match.index}`} code={code.trimEnd()} language={language} />);

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    elements.push(
      <div key={`text-${lastIndex}`} className="content-text-segment">
        {renderTextParagraphs(remainingText)}
      </div>
    );
  }

  return elements;
}

function renderTextParagraphs(text) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={idx} style={{ height: '0.45rem' }}></div>;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <h5 key={idx} className="mt-2 mb-1 fw-bold text-primary-emphasis" style={{ fontSize: '1.05rem' }}>
          {formatInline(trimmed.substring(4))}
        </h5>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h4 key={idx} className="mt-2 mb-1 fw-bold text-gradient" style={{ fontSize: '1.15rem' }}>
          {formatInline(trimmed.substring(3))}
        </h4>
      );
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={idx}
          className="border-start border-3 border-primary ps-3 my-2 text-secondary fst-italic"
          style={{ background: 'rgba(99, 102, 241, 0.06)', padding: '0.35rem 0.6rem', borderRadius: '4px' }}
        >
          {formatInline(trimmed.substring(2))}
        </blockquote>
      );
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <div key={idx} className="d-flex align-items-start gap-2 my-1 ps-2">
          <i className="bi bi-circle-fill text-primary" style={{ fontSize: '0.35rem', marginTop: '0.6rem' }}></i>
          <span>{formatInline(trimmed.substring(2))}</span>
        </div>
      );
    }

    // Standard paragraph
    return (
      <p key={idx} className="mb-1">
        {formatInline(line)}
      </p>
    );
  });
}

// Format inline bold **text** and inline code `code`
function formatInline(str) {
  const parts = [];
  // match **bold** or `code`
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIdx = 0;
  let m;

  while ((m = regex.exec(str)) !== null) {
    if (m.index > lastIdx) {
      parts.push(str.substring(lastIdx, m.index));
    }
    const token = m[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${m.index}`} className="fw-semibold text-light">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${m.index}`}
          className="px-1 py-0.5 rounded text-info"
          style={{ background: 'rgba(99, 102, 241, 0.15)', fontSize: '0.88em' }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = m.index + token.length;
  }

  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx));
  }

  return parts.length > 0 ? parts : str;
}

export function MessageBubble({ message, onSpeak, onStop, isSpeaking }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className={`message-avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? <i className="bi bi-person-fill"></i> : <i className="bi bi-stars"></i>}
      </div>

      <div className="message-content-wrapper">
        <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
          {isUser ? message.content : renderFormattedContent(message.content)}
        </div>

        <div className="message-meta d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span>{isUser ? 'You' : 'OCTO AI'}</span>
            <span>•</span>
            <span>{formattedTime}</span>

            {!isUser && message.engine && (
              <span
                className={`engine-badge ${message.engine.isRealAI ? 'real-ai' : 'demo-mode'}`}
                style={
                  message.engine.isRealAI
                    ? { background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }
                    : { background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', borderColor: 'rgba(234, 179, 8, 0.3)' }
                }
              >
                <i className={message.engine.isRealAI ? 'bi bi-stars' : 'bi bi-info-circle'}></i>
                {message.engine.isRealAI
                  ? `${message.engine.provider === 'gemini' ? 'Gemini' : message.engine.provider} (Live AI)`
                  : 'Offline Demo Engine'}
              </span>
            )}
          </div>

          <div className="message-actions">
            {!isUser && onSpeak && (
              <button
                className={`btn-action-icon ${isSpeaking ? 'text-primary' : ''}`}
                onClick={() => (isSpeaking ? onStop() : onSpeak(message.content))}
                title={isSpeaking ? 'Stop speaking' : 'Speak reply'}
              >
                <i className={`bi ${isSpeaking ? 'bi-volume-up-fill' : 'bi-volume-up'}`}></i>
              </button>
            )}

            <button className="btn-action-icon" onClick={handleCopyMessage} title="Copy message">
              <i className={`bi ${copied ? 'bi-check2 text-success' : 'bi-clipboard'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
