import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${String(d).padStart(2,'0')} ${MONTHS[m-1].slice(0,3)} ${y}`;
}

function pad(n: number) { return String(n).padStart(2, '0'); }
function toIso(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}`; }

export default function CustomDatePicker({ value, onChange, placeholder = 'Pick a date' }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse initial month/year from value or today
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Build month grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Mo=0 .. Su=6 (convert JS Sun=0 to Mo=0)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; iso: string; outOfMonth: boolean }[] = [];
  // Leading days (previous month)
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const pm = viewMonth === 0 ? 11 : viewMonth - 1;
    const py = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, iso: toIso(py, pm, d), outOfMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: toIso(viewYear, viewMonth, d), outOfMonth: false });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const next = cells.length - startOffset - daysInMonth + 1;
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: next, iso: toIso(ny, nm, next), outOfMonth: true });
    if (cells.length >= 42) break;
  }

  const todayIso = (() => {
    const t = new Date();
    return toIso(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  function pickDay(iso: string) {
    onChange(iso);
    setOpen(false);
  }

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
          color: value ? 'var(--text-primary)' : 'var(--text-placeholder)',
          fontFamily: 'var(--font-main)',
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
        <Calendar size={14} color="var(--text-muted)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          background: '#23262B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '14px',
          zIndex: 100,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          width: '280px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-main)', fontSize: '13px', fontWeight: 600 }}>
              {MONTHS[viewMonth]} {viewYear}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="button" onClick={prevMonth} style={iconBtn}><ChevronLeft size={14} color="#A8ADB5" /></button>
              <button type="button" onClick={nextMonth} style={iconBtn}><ChevronRight size={14} color="#A8ADB5" /></button>
            </div>
          </div>

          {/* Weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{
                fontFamily: 'var(--font-main)',
                fontSize: '10px',
                color: 'var(--text-placeholder)',
                textAlign: 'center',
                padding: '4px 0',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((c, i) => {
              const isSelected = c.iso === value;
              const isToday = c.iso === todayIso;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickDay(c.iso)}
                  style={{
                    background: isSelected ? 'var(--accent)' : isToday ? 'rgba(36, 119, 198, 0.12)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: isSelected ? 'var(--bg-base)'
                      : c.outOfMonth ? '#4A4F57'
                      : isToday ? 'var(--accent)'
                      : 'var(--text-secondary)',
                    fontFamily: 'var(--font-main)',
                    fontSize: '12.5px',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    padding: '8px 0',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--divider)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(36, 119, 198, 0.12)' : 'transparent';
                  }}
                >
                  {c.day}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--divider)' }}>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              style={textBtn}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pickDay(todayIso)}
              style={{ ...textBtn, color: 'var(--accent)' }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--divider)',
  borderRadius: '6px',
  padding: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

const textBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-main)',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  padding: '4px 8px',
};
