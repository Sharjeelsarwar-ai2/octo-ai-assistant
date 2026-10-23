import React, { useState } from 'react';

export function Sidebar({
  isOpen,
  onClose,
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAll
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'New Conversation').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={onClose}></div>}

      <aside className={`app-sidebar ${isOpen ? 'show' : ''}`}>
        {/* Top Header */}
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <button
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm rounded-3"
            onClick={() => {
              onNewConversation();
              if (window.innerWidth < 992) onClose();
            }}
          >
            <i className="bi bi-plus-lg fs-5"></i>
            <span className="fw-semibold">New Conversation</span>
          </button>

          {/* Search bar if multiple chats */}
          {conversations.length > 3 && (
            <div className="mt-3 position-relative">
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ fontSize: '0.8rem' }}
              ></i>
              <input
                type="text"
                className="form-control form-control-sm ps-4 bg-dark text-light border-secondary-subtle"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2" style={{ flex: 1 }}>
          <div className="px-2 py-1 text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
            Recent Chats ({filteredConversations.length})
          </div>

          {filteredConversations.length === 0 ? (
            <div className="text-center text-muted p-4 small">
              <i className="bi bi-chat-square-text d-block fs-3 mb-2 opacity-50"></i>
              {searchTerm ? 'No matching chats found' : 'No saved conversations yet. Start talking to OCTO AI!'}
            </div>
          ) : (
            <div className="d-flex flex-direction-column flex-column gap-1 mt-1">
              {filteredConversations.map((convo) => {
                const isActive = convo.id === currentConversationId;
                return (
                  <div
                    key={convo.id}
                    className={`d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none cursor-pointer ${isActive ? 'bg-primary-subtle text-primary fw-semibold' : 'text-secondary hover-bg'
                      }`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
                    }}
                    onClick={() => {
                      onSelectConversation(convo.id);
                      if (window.innerWidth < 992) onClose();
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 overflow-hidden me-2">
                      <i className={`bi ${isActive ? 'bi-chat-dots-fill text-primary' : 'bi-chat-left-text'}`}></i>
                      <span className="text-truncate small" style={{ maxWidth: 170 }}>
                        {convo.title || 'New Conversation'}
                      </span>
                    </div>

                    <button
                      className="btn-action-icon text-muted"
                      onClick={(e) => onDeleteConversation(convo.id, e)}
                      title="Delete chat"
                    >
                      <i className="bi bi-trash3" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
          {conversations.length > 0 && (
            <button
              className="btn btn-outline-danger btn-sm w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
              onClick={onClearAll}
            >
              <i className="bi bi-trash"></i>
              <span>Clear All History</span>
            </button>
          )}

          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 32,
                height: 32,
                background: 'rgba(0, 229, 255, 0.15)',
                color: 'var(--accent-cyan)'
              }}
            >
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div className="small">
              <div className="fw-semibold text-light" style={{ fontSize: '0.78rem' }}>
                Sharjeel
              </div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                Personal AI System
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
