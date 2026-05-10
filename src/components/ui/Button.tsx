import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export default function Button({
  children, onClick, variant = 'primary', disabled, type = 'button', className = ''
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: '#00bfff',
      color: '#0d1117',
      border: 'none',
      fontWeight: 600,
    },
    ghost: {
      background: 'rgba(255,255,255,0.06)',
      color: '#D5D8DE',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    danger: {
      background: 'rgba(248,81,73,0.15)',
      color: '#f85149',
      border: '1px solid rgba(248,81,73,0.3)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...styles[variant],
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'Poppins, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s ease, transform 0.1s ease',
      }}
    >
      {children}
    </button>
  );
}
