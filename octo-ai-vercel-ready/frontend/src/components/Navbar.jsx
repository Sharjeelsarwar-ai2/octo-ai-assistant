import React from 'react';
import StatusBadge from './StatusBadge.jsx';

export function Navbar({
  status,
  selectedVoice,
  onOpenVoiceSettings,
  onOpenConfigHelp,
  theme,
  onToggleTheme,
  onToggleSidebar
}) {
  return (
    <header className="app-navbar">
      <div className="d-flex align-items-center gap-3">
        {/* Mobile Sidebar Toggle Button */}
        <button
          className="btn btn-outline-secondary btn-sm d-lg-none py-1 px-2"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        {/* Brand Icon & Name */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{
              width: 36,
              height: 36,
              background: 'var(--accent-gradient)'
            }}
          >
            <i className="bi bi-stars text-dark fs-5 fw-bold"></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-5 text-gradient">OCTO AI</span>
              <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle d-none d-sm-inline" style={{ fontSize: '0.65rem' }}>
                v2.0
              </span>
            </div>
            <div className="text-muted small d-none d-md-block" style={{ fontSize: '0.72rem', marginTop: '-2px' }}>
              Sharjeel's Personal AI Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Middle Status Badges */}
      <StatusBadge
        status={status}
        selectedVoice={selectedVoice}
        onOpenConfigHelp={onOpenConfigHelp}
      />

      {/* Right Controls */}
      <div className="d-flex align-items-center gap-2">
        {/* Voice Settings Button */}
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 py-1 px-2 px-sm-3"
          onClick={onOpenVoiceSettings}
          title="Configure speech voice, rate, pitch, and auto-speak"
        >
          <i className="bi bi-soundwave text-info"></i>
          <span className="d-none d-sm-inline">Voice</span>
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          className="btn btn-sm btn-outline-secondary py-1 px-2"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-primary'}`}></i>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
