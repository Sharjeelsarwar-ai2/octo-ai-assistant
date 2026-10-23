import React from 'react';

export const MODES = [
  {
    id: 'assistant',
    label: 'Personal Assistant',
    icon: 'bi-stars',
    desc: 'General queries & everyday productivity'
  },
  {
    id: 'coding',
    label: 'Coding Mentor',
    icon: 'bi-code-slash',
    desc: 'Java, MERN, React, DSA, SQL & debugging'
  },
  {
    id: 'interview',
    label: 'Interview Coach',
    icon: 'bi-award',
    desc: 'Technical mock interviews & STAR feedback'
  },
  {
    id: 'english',
    label: 'English Practice',
    icon: 'bi-chat-heart',
    desc: 'Conversational fluency & grammar tips'
  }
];

export function ModeSelector({ activeMode, onSelectMode }) {
  return (
    <div className="mode-pill-bar" role="tablist" aria-label="Assistant modes">
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            className={`mode-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelectMode(mode.id)}
            title={mode.desc}
            role="tab"
            aria-selected={isActive}
          >
            <i className={`bi ${mode.icon}`}></i>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ModeSelector;
