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

  // Glass effect styles based on state
  const getCardStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 16px',
      minWidth: '180px',
      maxWidth: '320px',
      background: '#32363C',
      borderRadius: '12px',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      cursor: 'pointer',
    };

    if (isDone) {
      return {
        ...base,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
        opacity: 0.7,
      };
    }

    if (isFocused) {
      return {
        ...base,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
      };
    }

    return {
      ...base,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
    };
  };

  const hasChildren = (node.children?.length ?? 0) > 0;

  // Text styles
  const textStyles: React.CSSProperties = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  if (isDone) {
    textStyles.color = '#8A8F98';
    textStyles.textDecoration = 'line-through';
  } else if (isFocused) {
    textStyles.color = '#EDEFF3';
  } else {
    textStyles.color = '#D5D8DE';
  }

  return (
    <div style={{ ...getCardStyles(), ...style }}>
      {/* Status circle — toggles status only, does NOT open popup */}
      <div
        style={{ flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        onClick={(e) => { e.stopPropagation(); onCircleClick(); }}
      >
        {isDone ? (
          <CheckCircle size={20} weight="duotone" color="#00c896" />
        ) : (
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #8A8F98' }} />
        )}
      </div>

      {/* Text area — opens popup */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0, overflow: 'hidden' }}
        onClick={(e) => { e.stopPropagation(); onTextClick(); }}
      >
        {/* Numbering prefix */}
        <span style={{ fontSize: '12px', color: '#7D828B', fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>
          {numbering}
        </span>

        {/* Title */}
        <span style={{ ...textStyles, flex: 1 }}>{node.title}</span>

        {/* Expand/collapse chevron for nodes with children */}
        {hasChildren && (
          <ChevronRight
            size={14}
            color="#8A8F98"
            style={{
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
