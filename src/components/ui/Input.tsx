interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function Input({ value, onChange, placeholder, type = 'text', className = '', autoFocus }: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={className}
      style={{
        width: '100%',
        background: 'var(--divider)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        transition: 'border-color 0.2s ease',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(36,119,198,0.5)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  );
}
