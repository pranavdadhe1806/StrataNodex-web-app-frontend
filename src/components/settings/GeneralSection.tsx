import { Check } from 'lucide-react';
import { useThemeStore, Theme, Font, DateFormat, WeekStartDay } from '../../store/theme.store';

/* ─── Design tokens ────────────────────────────────────────── */
const DS = {
  bg: 'var(--bg-base)',
  textPrimary: 'var(--text-primary)',
  textMuted: 'var(--text-muted)',
  accent: 'var(--accent)',
  border: 'var(--border)',
  divider: 'var(--divider)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: DS.textMuted,
  fontFamily: 'var(--font-main)', marginBottom: 16,
};

const divider = <div style={{ height: 1, background: DS.divider, margin: '24px 0' }} />;

/* ─── Small Toggle (36×20) ──────────────────────────────────── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: enabled ? DS.accent : 'var(--border-bright)',
        cursor: 'pointer', transition: 'background 0.2s',
        position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: enabled ? 19 : 3, transition: 'left 0.2s',
      }} />
    </div>
  );
}

/* ─── Theme cards ───────────────────────────────────────────── */
const THEMES: { id: Theme; label: string; swatch: string[] }[] = [
  { id: 'dark', label: 'Dark', swatch: ['var(--bg-base)', 'var(--bg-card)', 'var(--accent)'] },
  { id: 'white', label: 'White', swatch: ['#F5F5F5', '#FFFFFF', '#0070cc'] },
  { id: 'grey', label: 'Grey', swatch: ['#2C2C2E', '#3A3A3C', '#636366'] },
];

/* ─── Font pills ────────────────────────────────────────────── */
const FONTS: { id: Font; label: string; preview: string; style: string; size: number; weight: number }[] = [
  { id: 'Poppins', label: 'Poppins', preview: 'Aa', style: "'Poppins', sans-serif", size: 16, weight: 400 },
  { id: 'Inter', label: 'Inter', preview: 'Aa', style: "'Inter', sans-serif", size: 16, weight: 400 },
  { id: 'JetBrains Mono', label: 'JetBrains Mono', preview: 'Aa', style: "'JetBrains Mono', monospace", size: 15, weight: 400 },
  { id: 'Indie Flower', label: 'Indie Flower', preview: 'Aa', style: "'Indie Flower', cursive", size: 24, weight: 600 },
];

/* ─── Date format options ───────────────────────────────────── */
const DATE_FORMATS: { value: DateFormat; label: string }[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY  (31/05/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY  (05/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD  (2025-05-31)' },
];

/* ─── Week-start options ────────────────────────────────────── */
const WEEK_DAYS: { value: WeekStartDay; label: string }[] = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function GeneralSection() {
  const {
    theme, font, dateFormat, timeFormat24, weekStartDay,
    setTheme, setFont, setDateFormat, setTimeFormat24, setWeekStartDay,
  } = useThemeStore();

  const selectStyle: React.CSSProperties = {
    background: DS.bg,
    border: `1px solid ${DS.border}`,
    borderRadius: 8, padding: '9px 12px',
    fontSize: 13, color: DS.textPrimary,
    fontFamily: 'var(--font-main)', outline: 'none',
    cursor: 'pointer', colorScheme: 'dark',
    width: 220, boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>

      {/* ── Appearance ── */}
      <div style={sectionLabel}>Appearance</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
        {THEMES.map(t => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                background: 'none', border: `2px solid ${active ? DS.accent : DS.border}`,
                borderRadius: 10, padding: '10px 12px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, width: 90,
                transition: 'border-color 0.15s',
                position: 'relative',
              }}
            >
              {/* mini swatch */}
              <div style={{
                width: 64, height: 40, borderRadius: 6, overflow: 'hidden',
                display: 'flex', flexDirection: 'column', gap: 3, padding: 4,
                background: t.swatch[0],
              }}>
                <div style={{ height: 10, borderRadius: 3, background: t.swatch[1] }} />
                <div style={{ height: 6, borderRadius: 3, background: t.swatch[2], width: '60%' }} />
                <div style={{ height: 6, borderRadius: 3, background: t.swatch[1], width: '80%' }} />
              </div>
              <span style={{ fontSize: 12, color: active ? DS.accent : DS.textMuted, fontWeight: active ? 600 : 400 }}>
                {t.label}
              </span>
              {active && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: DS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={10} color="var(--bg-base)" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {divider}

      {/* ── Font ── */}
      <div style={sectionLabel}>Font</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
        {FONTS.map(f => {
          const active = font === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFont(f.id)}
              style={{
                background: active ? 'rgba(36,119,198,0.06)' : 'none',
                border: `1px solid ${active ? DS.accent : DS.border}`,
                borderRadius: 8, padding: '8px 16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontFamily: f.style, fontSize: f.size, fontWeight: f.weight, color: active ? DS.accent : DS.textMuted }}>
                {f.preview}
              </span>
              <span style={{ fontSize: 13, color: active ? DS.accent : DS.textMuted, fontFamily: 'var(--font-main)', fontWeight: active ? 500 : 400 }}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>

      {divider}

      {/* ── Date & Time ── */}
      <div style={sectionLabel}>Date & Time</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Date format */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Date format</div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>How dates are displayed throughout the app</div>
          </div>
          <select
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value as DateFormat)}
            style={selectStyle}
          >
            {DATE_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div style={{ height: 1, background: DS.divider }} />

        {/* Time format */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Time format</div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>12-hour or 24-hour clock display</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: timeFormat24 ? DS.textMuted : DS.accent, fontWeight: timeFormat24 ? 400 : 600 }}>12h</span>
            <Toggle enabled={timeFormat24} onToggle={() => setTimeFormat24(!timeFormat24)} />
            <span style={{ fontSize: 12, color: timeFormat24 ? DS.accent : DS.textMuted, fontWeight: timeFormat24 ? 600 : 400 }}>24h</span>
          </div>
        </div>

        <div style={{ height: 1, background: DS.divider }} />

        {/* Week starts on */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Week starts on</div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>First day shown in weekly and calendar views</div>
          </div>
          <select
            value={weekStartDay}
            onChange={e => setWeekStartDay(parseInt(e.target.value, 10) as WeekStartDay)}
            style={selectStyle}
          >
            {WEEK_DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

      </div>
    </div>
  );
}
