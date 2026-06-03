import { useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAiChatStore } from '../../store/aiChat.store';
import { useUIStore } from '../../store/ui.store';
import { aiApi } from '../../api/ai.api';
import { executeOperations } from '../../utils/aiOperationExecutor';
import AiChatMessage from './AiChatMessage';
import AiChatInput from './AiChatInput';

// ─── Styles ───────────────────────────────────────────────────────────────────

const panel: CSSProperties = {
  position: 'fixed',
  bottom: 80,
  right: 20,
  width: 400,
  maxHeight: 560,
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-elevated)',
  zIndex: 1000,
  overflow: 'hidden',
};

const header: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 14px',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-surface)',
  flexShrink: 0,
};

const headerLeft: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
  minWidth: 0,
};

const sessionTitle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
};

const headerActions: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
};

const iconBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '5px',
  borderRadius: '7px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s, background 0.15s',
};

const sessionListOverlay: CSSProperties = {
  background: 'var(--bg-surface)',
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
  maxHeight: 200,
  overflowY: 'auto',
};

const sessionItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 14px',
  cursor: 'pointer',
  borderBottom: '1px solid var(--border)',
  transition: 'background 0.12s',
  gap: '8px',
};

const sessionItemTitle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
};

const messagesArea: CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  minHeight: 180,
};

const emptyState: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: '8px',
  color: 'var(--text-muted)',
  fontSize: '13px',
  textAlign: 'center',
  padding: '32px 20px',
};

const fabBtn: CSSProperties = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 46,
  height: 46,
  borderRadius: '13px',
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--accent)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'var(--shadow-elevated)',
  zIndex: 998,
  transition: 'transform 0.15s, box-shadow 0.15s',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L14 9 L20 9 L15 13 L17 19 L12 15 L7 19 L9 13 L4 9 L10 9 Z" />
    </svg>
  );
}

function NewChatIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V12" />
      <path d="M17 3l4 4-9 9H8v-4z" />
    </svg>
  );
}

function HistoryIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14" />
      <path d="M3.05 11a9 9 0 1 1 .5 4" />
      <polyline points="3 16 3 11 8 11" />
    </svg>
  );
}

function CloseIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiChatPanel() {
  const {
    isOpen, isLoading, messages,
    activeSessionId, sessions, showSessionList,
    toggle, close, addMessage, setLoading,
    setSessions, setActiveSessionId, setMessages, clearMessages,
    toggleSessionList, addSessionToList, removeSessionFromList,
  } = useAiChatStore();

  const { activeListId, activeFolderId } = useUIStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ─── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ─── Load sessions on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    aiApi.getSessions().then(setSessions).catch(() => {});
  }, [isOpen, setSessions]);

  // ─── Keyboard shortcut: Ctrl+K ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  // ─── Click outside to close ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as HTMLElement)) {
        close();
      }
    };
    const timer = setTimeout(() => window.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handler);
    };
  }, [isOpen, close]);

  // ─── Load a session's messages ─────────────────────────────────────────────
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const detail = await aiApi.getSession(sessionId);
      setMessages(detail.messages);
      setActiveSessionId(sessionId);
      toggleSessionList(); // close the list after selection
    } catch {
      // ignore
    }
  }, [setMessages, setActiveSessionId, toggleSessionList]);

  // ─── Start a new chat ──────────────────────────────────────────────────────
  const startNewChat = useCallback(() => {
    clearMessages();
    setActiveSessionId(null);
    if (showSessionList) toggleSessionList();
  }, [clearMessages, setActiveSessionId, showSessionList, toggleSessionList]);

  // ─── Delete a session ──────────────────────────────────────────────────────
  const deleteSession = useCallback(async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await aiApi.deleteSession(sessionId);
      removeSessionFromList(sessionId);
      if (activeSessionId === sessionId) {
        clearMessages();
        setActiveSessionId(null);
      }
    } catch {
      // ignore
    }
  }, [removeSessionFromList, activeSessionId, clearMessages, setActiveSessionId]);

  // ─── Send message ──────────────────────────────────────────────────────────
  const handleSubmit = async (message: string) => {
    addMessage({ role: 'user', content: message });
    setLoading(true);

    try {
      const currentContext: { folderId?: string; listId?: string } = {};
      if (activeFolderId) currentContext.folderId = activeFolderId;
      if (activeListId) currentContext.listId = activeListId;

      const response = await aiApi.chat(message, activeSessionId, currentContext);

      // On first message, a new session was created — track it
      if (!activeSessionId && response.sessionId) {
        setActiveSessionId(response.sessionId);
        // Add the new session to the top of the list
        addSessionToList({
          id: response.sessionId,
          title: message.slice(0, 60),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Execute operations
      if (response.operations?.length > 0) {
        try {
          await executeOperations(response.operations, queryClient);
        } catch (execErr) {
          addMessage({
            role: 'assistant',
            content: `I planned the changes but an error occurred while executing: ${(execErr as Error).message}`,
          });
          setLoading(false);
          return;
        }
      }

      // Show assistant response
      const parts: string[] = [];
      if (response.clarificationNeeded) {
        parts.push(response.clarificationNeeded);
      } else {
        if (response.confirmation) parts.push(response.confirmation);
        if (response.followUpQuestion) parts.push(response.followUpQuestion);
      }
      if (parts.length > 0) {
        addMessage({ role: 'assistant', content: parts.join('\n\n') });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Something went wrong. Please try again.';
      addMessage({ role: 'assistant', content: msg });
    } finally {
      setLoading(false);
    }
  };

  // ─── Current session title ─────────────────────────────────────────────────
  const currentTitle = activeSessionId
    ? (sessions.find((s) => s.id === activeSessionId)?.title ?? 'AI Assistant')
    : 'AI Assistant';

  return (
    <>
      {/* FAB trigger */}
      {!isOpen && (
        <button
          onClick={toggle}
          style={fabBtn}
          aria-label="Open AI assistant"
          title="AI Assistant (Ctrl+K)"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          <SparkleIcon size={20} />
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div ref={panelRef} style={panel}>
          {/* Header */}
          <div style={header}>
            <div style={headerLeft}>
              <SparkleIcon size={14} />
              <span style={sessionTitle} title={currentTitle}>{currentTitle}</span>
            </div>
            <div style={headerActions}>
              {/* New Chat */}
              <button
                style={iconBtn}
                title="New chat"
                onClick={startNewChat}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <NewChatIcon />
              </button>
              {/* History */}
              <button
                style={{ ...iconBtn, color: showSessionList ? 'var(--accent)' : 'var(--text-muted)' }}
                title="Chat history"
                onClick={toggleSessionList}
                onMouseEnter={(e) => { if (!showSessionList) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { if (!showSessionList) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <HistoryIcon />
              </button>
              {/* Close */}
              <button
                style={iconBtn}
                onClick={close}
                title="Close"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Session list (collapsible) */}
          {showSessionList && (
            <div style={sessionListOverlay}>
              {sessions.length === 0 ? (
                <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No previous chats
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    style={{
                      ...sessionItem,
                      background: sess.id === activeSessionId ? 'var(--bg-card)' : 'transparent',
                    }}
                    onClick={() => loadSession(sess.id)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        sess.id === activeSessionId ? 'var(--bg-card)' : 'transparent';
                    }}
                  >
                    <span style={sessionItemTitle} title={sess.title}>{sess.title}</span>
                    <button
                      style={{ ...iconBtn, padding: '3px', flexShrink: 0 }}
                      onClick={(e) => deleteSession(e, sess.id)}
                      title="Delete chat"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#e05555'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Messages */}
          <div style={messagesArea}>
            {messages.length === 0 && !isLoading ? (
              <div style={emptyState}>
                <SparkleIcon size={26} />
                <p style={{ fontWeight: 500, color: 'var(--text-secondary)', marginTop: 4 }}>StrataNodex AI</p>
                <p style={{ fontSize: '12px', maxWidth: '240px', lineHeight: 1.5 }}>
                  Create tasks, set deadlines, change priorities — just type naturally.
                </p>
                <p style={{ fontSize: '11px', opacity: 0.5, marginTop: 2 }}>Ctrl+K to toggle</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <AiChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && <AiChatMessage role="assistant" content="" isTyping />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <AiChatInput onSubmit={handleSubmit} disabled={isLoading} />
        </div>
      )}
    </>
  );
}
