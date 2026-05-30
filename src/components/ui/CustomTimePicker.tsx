import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // HH:MM (24h)
  onChange: (value: string) => void;
  placeholder?: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function to12h(hh24: number): { h12: number; period: 'AM' | 'PM' } {
  if (hh24 === 0) return { h12: 12, period: 'AM' };
  if (hh24 === 12) return { h12: 12, period: 'PM' };
  if (hh24 > 12) return { h12: hh24 - 12, period: 'PM' };
  return { h12: hh24, period: 'AM' };
}

function to24h(h12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function formatDisplay(value: string): string {
  if (!value) return '';
  const [hh, mm] = value.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return '';
  const { h12, period } = to12h(hh);
  return `${h12}:${pad(mm)} ${period}`;
}

export default function CustomTimePicker({ value, onChange, placeholder = '--:--' }: CustomTimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initialHh = value ? parseInt(value.split(':')[0], 10) : 9;
  const initialMm = value ? parseInt(value.split(':')[1], 10) : 0;
  const init12 = to12h(isNaN(initialHh) ? 9 : initialHh);
  const [hour, setHour] = useState(init12.h12);
  const [minute, setMinute] = useState(isNaN(initialMm) ? 0 : initialMm);
  const [period, setPeriod] = useState<'AM' | 'PM'>(init12.period);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        commit();
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hour, minute, period]);

  function commit() {
    const hh24 = to24h(hour, period);
    onChange(`${pad(hh24)}:${pad(minute)}`);
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'var(--bg-input)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: value ? 'var(--text-primary)' : 'var(--text-placeholder)',
          fontFamily: 'var(--font-main)',
          fontSize: '13px',
          padding: '9px 12px',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(36,119,198,0.12)' : 'none',
        }}
      >
        <span style={{ fontWeight: value ? 500 : 400 }}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Clock
          size={14}
          color="var(--text-muted)"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px',
            zIndex: 200,
            boxShadow: 'var(--shadow-elevated)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '220px',
          }}
        >
          {/* Time display */}
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-main)',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            padding: '4px 0 8px',
            borderBottom: '1px solid var(--divider)',
          }}>
            {pad(hour)}:{pad(minute)} <span style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 500 }}>{period}</span>
          </div>

          {/* Columns */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            {/* Hours */}
            <ScrollColumn
              items={hours.map(h => ({ value: h, label: pad(h) }))}
              selected={hour}
              onSelect={setHour}
            />

            {/* Separator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '18px',
              padding: '0 2px',
            }}>:</div>

            {/* Minutes */}
            <ScrollColumn
              items={minutes.map(m => ({ value: m, label: pad(m) }))}
              selected={minute}
              onSelect={setMinute}
            />

            {/* AM/PM */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              justifyContent: 'center',
              paddingLeft: '4px',
            }}>
              {(['AM', 'PM'] as const).map(p => {
                const isActive = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    style={{
                      background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '6px',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-main)',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '7px 10px',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      minWidth: '44px',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Done button */}
          <button
            type="button"
            onClick={() => { commit(); setOpen(false); }}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontFamily: 'var(--font-main)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px',
              cursor: 'pointer',
              width: '100%',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

function ScrollColumn({
  items,
  selected,
  onSelect,
}: {
  items: { value: number; label: string }[];
  selected: number;
  onSelect: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current.querySelector(`[data-val="${selected}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'center' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      style={{
        height: '140px',
        overflowY: 'auto',
        flex: 1,
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--scrollbar-thumb) transparent',
        borderRadius: '6px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      }}
    >
      {items.map(it => {
        const isActive = it.value === selected;
        return (
          <button
            key={it.value}
            data-val={it.value}
            type="button"
            onClick={() => onSelect(it.value)}
            style={{
              width: '100%',
              background: isActive ? 'var(--accent)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-main)',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              padding: '5px 0',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'background 0.1s, color 0.1s',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--divider)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
