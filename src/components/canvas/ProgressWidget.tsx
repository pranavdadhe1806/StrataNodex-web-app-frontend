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
        background: '#32363C',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '14px 18px',
        minWidth: '220px',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: '#D5D8DE',
          marginBottom: '8px',
        }}
      >
        Total Progress:
      </div>

      {/* Progress Bar Track */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
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
            background: '#00bfff',
            borderRadius: '3px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Completed Count */}
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '12px',
          color: '#8A8F98',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <CheckCircle size={16} weight="duotone" color="#00c896" />
        Total Task Completed: {done}/{total}
      </div>
    </div>
  );
}
