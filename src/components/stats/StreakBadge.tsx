import { Fire } from '@phosphor-icons/react';

interface StreakBadgeProps {
  streak: number;
  label?: string;
}

export default function StreakBadge({ streak, label = 'Day Streak' }: StreakBadgeProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '20px 24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--divider), inset 0 1px 0 var(--divider)',
      }}
    >
      <Fire size={28} weight="duotone" color="var(--accent-teal)" />
      <span
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '24px',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {streak}
      </span>
      <span
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '12px',
          fontWeight: 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}
