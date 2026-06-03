import { useState, useRef, useEffect, type CSSProperties, type KeyboardEvent } from 'react';

interface AiChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

const containerStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-end',
  padding: '12px',
  borderTop: '1px solid var(--border)',
  background: 'var(--bg-surface)',
};

const textareaStyle: CSSProperties = {
  flex: 1,
  resize: 'none',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  padding: '10px 14px',
  fontSize: '13px',
  lineHeight: 1.5,
  fontFamily: 'var(--font-main, inherit)',
  outline: 'none',
  maxHeight: '120px',
  minHeight: '40px',
  overflow: 'auto',
};

const btnStyle: CSSProperties = {
  border: 'none',
  borderRadius: '10px',
  background: 'var(--accent)',
  color: '#fff',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  flexShrink: 0,
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.15s',
};

export default function AiChatInput({ onSubmit, disabled }: AiChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={containerStyle}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your workspace..."
        disabled={disabled}
        rows={1}
        style={{
          ...textareaStyle,
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        style={{
          ...btnStyle,
          opacity: disabled || !value.trim() ? 0.4 : 1,
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
        }}
        aria-label="Send message"
      >
        {/* Send arrow icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
