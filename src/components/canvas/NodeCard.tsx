import type { Node } from '../../types/node.types';

interface NodeCardProps {
  node: Node;
  isFocused: boolean;
  numbering: string;
  onCircleClick: () => void;
  onTextClick: () => void;
  style?: React.CSSProperties;
}

export default function NodeCard({
  node,
  isFocused,
  numbering,
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

  // Status circle styles
  const circleStyles: React.CSSProperties = {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
  };

  if (isDone) {
    circleStyles.background = '#00c896';
    circleStyles.border = 'none';
  } else {
    circleStyles.border = '1.5px solid #8A8F98';
    circleStyles.background = 'transparent';
  }

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
    <div style={{ ...getCardStyles(), ...style }} onClick={onTextClick}>
      {/* Status Circle */}
      <div style={circleStyles} onClick={(e) => { e.stopPropagation(); onCircleClick(); }}>
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1.5" stroke="#1B1D21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Numbering prefix */}
      <span style={{ fontSize: '12px', color: '#7D828B', fontFamily: 'Poppins, sans-serif' }}>
        {numbering}
      </span>

      {/* Title */}
      <span style={textStyles}>{node.title}</span>
    </div>
  );
}
