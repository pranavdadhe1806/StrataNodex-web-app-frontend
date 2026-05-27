import { Clock } from '@phosphor-icons/react';

interface DailyTaskItemProps {
  title: string;
  listName: string;
  isOverdue?: boolean;
  isDone?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

export default function DailyTaskItem({
  title,
  listName,
  isOverdue = false,
  isDone = false,
  onToggle,
  onClick,
}: DailyTaskItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--bg-card)',
        border: `1px solid ${isOverdue ? 'rgba(248, 81, 73, 0.25)' : 'var(--border)'}`,
        borderRadius: '10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Status circle / toggle */}
      <div
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: isDone ? 'none' : '1.5px solid var(--text-muted)',
          background: isDone ? 'var(--accent-teal)' : 'transparent',
          flexShrink: 0,
          cursor: onToggle ? 'pointer' : 'default',
        }}
      />

      {/* Task info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: isDone ? 'var(--text-muted)' : 'var(--text-secondary)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            textDecoration: isDone ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        <div style={{ color: 'var(--text-placeholder)', fontFamily: 'Poppins, sans-serif', fontSize: '12px', marginTop: '2px' }}>
          {listName}
        </div>
      </div>

      {/* Overdue indicator */}
      {isOverdue && !isDone && (
        <Clock size={16} weight="duotone" color="#f85149" />
      )}
    </div>
  );
}
