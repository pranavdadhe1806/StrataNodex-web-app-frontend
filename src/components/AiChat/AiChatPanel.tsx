import { useEffect, useRef, type CSSProperties } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAiChatStore } from '../../store/aiChat.store';
import { useUIStore } from '../../store/ui.store';
import { aiApi } from '../../api/ai.api';
import { executeOperations } from '../../utils/aiOperationExecutor';
import AiChatMessage from './AiChatMessage';
import AiChatInput from './AiChatInput';

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 999,
  pointerEvents: 'none',
};

const panel: CSSProperties = {
  position: 'fixed',
  bottom: 80,
  right: 20,
  width: 380,
  maxHeight: 520,
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-elevated)',
  zIndex: 1000,
  pointerEvents: 'auto',
  overflow: 'hidden',
};

const header: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px 12px',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-surface)',
};

const headerTitle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-main, inherit)',
};

const closeBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s',
};

const messagesArea: CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  minHeight: 200,
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
  padding: '40px 20px',
};

const fabBtn: CSSProperties = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 48,
  height: 48,
  borderRadius: '14px',
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

// ─── Sparkle SVG Icon ─────────────────────────────────────────────────────────

function SparkleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L14 9 L20 9 L15 13 L17 19 L12 15 L7 19 L9 13 L4 9 L10 9 Z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiChatPanel() {
  const { isOpen, messages, isLoading, toggle, close, addMessage, setLoading } = useAiChatStore();
  const { activeListId, activeFolderId } = useUIStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
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

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as HTMLElement)) {
        close();
      }
    };
    // Delay listener so the opening click doesn't immediately close
    const timer = setTimeout(() => window.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handler);
    };
  }, [isOpen, close]);

  const handleSubmit = async (message: string) => {
    // Add user message to chat
    addMessage({ role: 'user', content: message });
    setLoading(true);

    try {
      const currentContext: { folderId?: string; listId?: string } = {};
      if (activeFolderId) currentContext.folderId = activeFolderId;
      if (activeListId) currentContext.listId = activeListId;

      // Build conversation history from current messages + this new message
      const history = [...useAiChatStore.getState().messages];

      const response = await aiApi.chat(message, history, currentContext);

      // Execute operations if any
      if (response.operations && response.operations.length > 0) {
        try {
          await executeOperations(response.operations, queryClient);
        } catch (execErr) {
          console.error('AI operation execution error:', execErr);
          addMessage({
            role: 'assistant',
            content: `I planned the changes but an error occurred while executing: ${(execErr as Error).message}`,
          });
          setLoading(false);
          return;
        }
      }

      // Build the assistant response message
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

  return (
    <>
      {/* FAB trigger button */}
      {!isOpen && (
        <button
          onClick={toggle}
          style={fabBtn}
          aria-label="Open AI assistant"
          title="AI Assistant (Ctrl+K)"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          <SparkleIcon size={22} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div style={overlay}>
          <div ref={panelRef} style={panel}>
            {/* Header */}
            <div style={header}>
              <div style={headerTitle}>
                <SparkleIcon size={16} />
                <span>AI Assistant</span>
              </div>
              <button
                onClick={close}
                style={closeBtn}
                aria-label="Close AI assistant"
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div style={messagesArea}>
              {messages.length === 0 && !isLoading ? (
                <div style={emptyState}>
                  <SparkleIcon size={28} />
                  <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                    StrataNodex AI
                  </p>
                  <p style={{ fontSize: '12px', maxWidth: '250px' }}>
                    Ask me to create folders, lists, tasks, set deadlines, change priorities — anything.
                  </p>
                  <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                    Ctrl+K to toggle
                  </p>
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
        </div>
      )}
    </>
  );
}
