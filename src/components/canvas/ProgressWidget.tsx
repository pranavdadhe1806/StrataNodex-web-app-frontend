import { CheckCircle } from '@phosphor-icons/react';

interface ProgressWidgetProps {
  total: number;
  done: number;
}

export default function ProgressWidget({ total, done }: ProgressWidgetProps) {
  // Only render if there are tasks
  if (total === 0) return null;

  const percentage = Math.round((done / total) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        top: '72px', // 56px topbar + 16px gap
        right: '24px',
        zIndex: 50,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-card)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '14px 18px',
        minWidth: '220px',
      }}
    >
      {/* Label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          Total Progress:
        </div>
        <div
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {percentage}%
        </div>
      </div>

      {/* Progress Bar Track */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'var(--border)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        {/* Progress Bar Fill */}
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: 'var(--accent)',
            borderRadius: '3px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Completed Count */}
      <div
        style={{
          fontFamily: 'var(--font-main)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <CheckCircle size={16} weight="duotone" style={{ color: 'var(--accent-teal)' }} />
        Total Task Completed: {done}/{total}
      </div>
    </div>
  );
}
