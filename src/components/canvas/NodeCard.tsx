import { useRef } from 'react';
import { ChevronRight } from '../ui/icons';
import { CheckCircle } from '@phosphor-icons/react';
import { motion, PanInfo } from 'framer-motion';
import type { Node } from '../../types/node.types';

interface NodeCardProps {
  node: Node;
  isFocused: boolean;
  numbering: string;
  isExpanded?: boolean;
  onCircleClick: () => void;
  onTextClick: () => void;
  onDragStart?: () => void;
  onDrag?: (y: number, x: number) => void;
  onDragEnd?: (y: number, x: number) => void;
  style?: React.CSSProperties;
}

export default function NodeCard({
  node,
  isFocused,
  numbering,
  isExpanded = true,
  onCircleClick,
  onTextClick,
  onDragStart,
  onDrag,
  onDragEnd,
  style,
}: NodeCardProps) {
  const isDone = node.status === 'DONE';
  // Track the pointerdown target so onTap knows if the circle was tapped
  const tapStartTarget = useRef<EventTarget | null>(null);

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
    <motion.div
      style={{ ...getCardStyles(), ...style }}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: 'var(--shadow-elevated)', 
        zIndex: 9999,
        cursor: 'grabbing' 
      }}
      drag
      dragMomentum={false}
      onDragStart={() => onDragStart?.()}
      onDrag={(_e, info: PanInfo) => {
        const startX = (style?.left as number) || 0;
        const startY = (style?.top as number) || 0;
        onDrag?.(startY + info.offset.y, startX + info.offset.x);
      }}
      onDragEnd={(_e, info: PanInfo) => {
        const startX = (style?.left as number) || 0;
        const startY = (style?.top as number) || 0;
        onDragEnd?.(startY + info.offset.y, startX + info.offset.x);
      }}
      onPointerDown={(e: React.PointerEvent) => {
        // Save the actual element that was clicked (before pointer capture redirects)
        tapStartTarget.current = e.target;
        // Prevent pan on canvas
        e.stopPropagation();
      }}
      // Use Framer Motion's onTap instead of onClick — it fires reliably
      // even with drag enabled (pointer capture doesn't suppress it)
      onTap={() => {
        const target = tapStartTarget.current as HTMLElement | null;
        tapStartTarget.current = null;
        // If the tap started on the status circle, ignore (circle handles its own event)
        if (target && target.closest('[data-role="status-circle"]')) return;
        onTextClick();
      }}
    >
      {/* Status circle */}
      <div
        data-role="status-circle"
        style={{ flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        onClick={(e) => { e.stopPropagation(); onCircleClick(); }}
      >
        {isDone ? (
          <CheckCircle size={20} weight="duotone" style={{ color: 'var(--accent-teal)' }} />
        ) : (
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid var(--node-circle-border)' }} />
        )}
      </div>

      {/* Text area — no click handlers here, onTap on motion.div handles it */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0, overflow: 'hidden' }}
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
    </motion.div>
  );
}
