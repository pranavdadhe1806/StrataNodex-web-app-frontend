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

  // Derive current selection
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

  function selectHour(h: number) { setHour(h); }
  function selectMinute(m: number) { setMinute(m); }
  function selectPeriod(p: 'AM' | 'PM') { setPeriod(p); }

  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
  const minutes = Array.from({ length: 60 }, (_, i) => i);   // 0..59

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${open ? 'rgba(0, 191, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
          borderRadius: '8px',
          color: value ? '#EDEFF3' : '#7D828B',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '13px',
          padding: '8px 12px',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          transition: 'border-color 0.15s',
        }}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <Clock size={14} color="#8A8F98" />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          background: '#23262B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          zIndex: 100,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          display: 'flex',
          gap: '8px',
          width: '260px',
        }}>
          {/* Hour column */}
          <ScrollColumn
            items={hours.map(h => ({ value: h, label: pad(h) }))}
            selected={hour}
            onSelect={selectHour}
          />
          <ScrollColumn
            items={minutes.map(m => ({ value: m, label: pad(m) }))}
            selected={minute}
            onSelect={selectMinute}
          />
          {/* AM/PM */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            justifyContent: 'flex-start',
            paddingTop: '4px',
          }}>
            {(['AM','PM'] as const).map(p => {
              const isActive = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => selectPeriod(p)}
                  style={{
                    background: isActive ? '#00bfff' : 'rgba(255,255,255,0.04)',
                    border: 'none',
                    borderRadius: '6px',
                    color: isActive ? '#1B1D21' : '#D5D8DE',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    minWidth: '52px',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Done */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
          }}>
            <button
              type="button"
              onClick={() => { commit(); setOpen(false); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#00bfff',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 6px',
              }}
            >
              Done
            </button>
          </div>
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

  // Center selected on open
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
        height: '180px',
        overflowY: 'auto',
        flex: 1,
        scrollbarWidth: 'thin',
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
              background: isActive ? '#00bfff' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: isActive ? '#1B1D21' : '#D5D8DE',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              padding: '6px 0',
              cursor: 'pointer',
              textAlign: 'center',
              marginBottom: '2px',
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
