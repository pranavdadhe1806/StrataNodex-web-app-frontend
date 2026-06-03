import type { CSSProperties } from 'react';

interface AiChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

const userBubble: CSSProperties = {
  alignSelf: 'flex-end',
  background: 'var(--accent)',
  color: '#fff',
  borderRadius: '16px 16px 4px 16px',
  padding: '10px 14px',
  maxWidth: '85%',
  fontSize: '13px',
  lineHeight: 1.55,
  wordBreak: 'break-word',
};

const aiBubble: CSSProperties = {
  alignSelf: 'flex-start',
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  borderRadius: '16px 16px 16px 4px',
  padding: '10px 14px',
  maxWidth: '85%',
  fontSize: '13px',
  lineHeight: 1.55,
  wordBreak: 'break-word',
  border: '1px solid var(--border)',
};

const dotContainer: CSSProperties = {
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
  padding: '4px 0',
};

export default function AiChatMessage({ role, content, isTyping }: AiChatMessageProps) {
  if (isTyping) {
    return (
      <div style={aiBubble}>
        <div style={dotContainer}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--text-muted)',
                animation: `aiDotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={role === 'user' ? userBubble : aiBubble}>
      {content}
    </div>
  );
}
