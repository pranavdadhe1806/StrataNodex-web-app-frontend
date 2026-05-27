import { useState } from 'react';

const DS = {
  bg: 'var(--bg-base)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  accent: 'var(--accent)',
  border: 'var(--border)',
  divider: 'var(--divider)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: DS.textMuted,
  fontFamily: 'var(--font-main)', marginBottom: 20,
};

const inputBase: React.CSSProperties = {
  background: DS.bg,
  border: `1px solid ${DS.border}`,
  borderRadius: 8, padding: '9px 12px',
  fontSize: 13, color: DS.textPrimary,
  fontFamily: 'var(--font-main)', outline: 'none',
  cursor: 'pointer', colorScheme: 'dark' as const,
  boxSizing: 'border-box',
};

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

interface SettingRowProps {
  label: string;
  subtitle: string;
  control: React.ReactNode;
  last?: boolean;
}

function SettingRow({ label, subtitle, control, last }: SettingRowProps) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0', gap: 16,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500, fontFamily: 'var(--font-main)' }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, fontFamily: 'var(--font-main)', lineHeight: 1.5 }}>
            {subtitle}
          </div>
        </div>
        {control}
      </div>
      {!last && <div style={{ height: 1, background: DS.divider }} />}
    </>
  );
}

export default function ProductivitySection() {
  const [listView, setListView] = useState<'tree' | 'flat'>('tree');
  const [completedVisibility, setCompletedVisibility] = useState('Always');
  const [autoArchive, setAutoArchive] = useState('Never');
  const [resetTime, setResetTime] = useState('00:00');

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      <div style={sectionLabel}>Task behaviour</div>

      <SettingRow
        label="Default list view"
        subtitle="How tasks appear when you open a list"
        control={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: listView === 'tree' ? DS.accent : DS.textMuted, fontWeight: listView === 'tree' ? 600 : 400 }}>Tree</span>
            <Toggle enabled={listView === 'flat'} onToggle={() => setListView(v => v === 'tree' ? 'flat' : 'tree')} />
            <span style={{ fontSize: 12, color: listView === 'flat' ? DS.accent : DS.textMuted, fontWeight: listView === 'flat' ? 600 : 400 }}>Flat</span>
          </div>
        }
      />

      <SettingRow
        label="Show completed tasks"
        subtitle="Toggle visibility of done items"
        control={
          <select
            value={completedVisibility}
            onChange={e => setCompletedVisibility(e.target.value)}
            style={{ ...inputBase, width: 160 }}
          >
            {['Always', 'Hidden', 'Collapsible'].map(o => <option key={o}>{o}</option>)}
          </select>
        }
      />

      <SettingRow
        label="Auto-archive completed tasks"
        subtitle="Move to archive after N days"
        control={
          <select
            value={autoArchive}
            onChange={e => setAutoArchive(e.target.value)}
            style={{ ...inputBase, width: 160 }}
          >
            {['Never', '7 days', '30 days'].map(o => <option key={o}>{o}</option>)}
          </select>
        }
      />

      <SettingRow
        label="Daily reset time"
        subtitle="When today's task list rolls over"
        last
        control={
          <input
            type="time"
            value={resetTime}
            onChange={e => setResetTime(e.target.value)}
            style={{ ...inputBase, width: 140 }}
          />
        }
      />
    </div>
  );
}
