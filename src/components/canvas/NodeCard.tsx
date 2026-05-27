import { ChevronRight } from '../ui/icons';
import { CheckCircle } from '@phosphor-icons/react';
import type { Node } from '../../types/node.types';

interface NodeCardProps {
  node: Node;
  isFocused: boolean;
  numbering: string;
  isExpanded?: boolean;
  onCircleClick: () => void;
  onTextClick: () => void;
  style?: React.CSSProperties;
}

export default function NodeCard({
  node,
  isFocused,
  numbering,
  isExpanded = true,
  onCircleClick,
  onTextClick,
  style,
}: NodeCardProps) {
  const isDone = node.status === 'DONE';

  const getCardStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 16px',
      minWidth: '180px',
      maxWidth: '320px',
      background: 'var(--node-bg)',
      borderRadius: '12px',
      cursor: 'pointer',
    };

    if (isDone) {
      return {
        ...base,
        border: '1px solid var(--divider)',
        boxShadow: 'var(--shadow-card)',
        opacity: 0.7,
      };
    }

    if (isFocused) {
      return {
        ...base,
        border: '1px solid var(--node-border-focused)',
        boxShadow: 'var(--shadow-elevated)',
      };
    }

    return {
      ...base,
      border: '1px solid var(--node-border)',
      boxShadow: 'var(--shadow-card)',
    };
  };

  const hasChildren = (node.children?.length ?? 0) > 0;

  const textStyles: React.CSSProperties = {
    fontFamily: 'var(--font-main)',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  if (isDone) {
    textStyles.color = 'var(--node-text-done)';
    textStyles.textDecoration = 'line-through';
  } else if (isFocused) {
    textStyles.color = 'var(--node-text-focused)';
  } else {
    textStyles.color = 'var(--node-text)';
  }

  return (
    <div
      style={{ ...getCardStyles(), ...style }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Status circle */}
      <div
        style={{ flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        onClick={(e) => { e.stopPropagation(); onCircleClick(); }}
      >
        {isDone ? (
          <CheckCircle size={20} weight="duotone" style={{ color: 'var(--accent-teal)' }} />
        ) : (
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid var(--node-circle-border)' }} />
        )}
      </div>

      {/* Text area */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0, overflow: 'hidden' }}
        onClick={(e) => { e.stopPropagation(); onTextClick(); }}
      >
        <span style={{ fontSize: '12px', color: 'var(--node-numbering)', fontFamily: 'var(--font-main)', flexShrink: 0 }}>
          {numbering}
        </span>
        <span style={{ ...textStyles, flex: 1 }}>{node.title}</span>
        {hasChildren && (
          <ChevronRight
            size={14}
            style={{
              color: 'var(--text-muted)',
              flexShrink: 0,
              marginLeft: 'auto',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        )}
      </div>
    </div>
  );
}
