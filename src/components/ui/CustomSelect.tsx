import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ value, options, onChange, placeholder = 'Select…' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'var(--divider)',
          border: `1px solid ${open ? 'rgba(36, 119, 198, 0.4)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: selected ? 'var(--text-primary)' : 'var(--text-placeholder)',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '13px',
          padding: '8px 12px',
          outline: 'none',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selected?.color && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: selected.color, flexShrink: 0,
            }} />
          )}
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={14} color="var(--text-muted)" style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.15s',
        }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#23262B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '4px',
          zIndex: 100,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          maxHeight: '220px',
          overflowY: 'auto',
        }}>
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: '100%',
                  background: isSelected ? 'rgba(36, 119, 198, 0.12)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--divider)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {opt.color && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: opt.color, flexShrink: 0,
                    }} />
                  )}
                  {opt.label}
                </span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
