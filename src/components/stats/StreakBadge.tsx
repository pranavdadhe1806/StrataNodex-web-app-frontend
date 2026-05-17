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
        background: '#32363C',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
      }}
    >
      <Fire size={28} weight="duotone" color="#00c896" />
      <span
        style={{
          color: '#EDEFF3',
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
          color: '#8A8F98',
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
