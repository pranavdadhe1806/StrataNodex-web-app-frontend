import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import client from '../../api/client';

const DS = {
  bg: 'var(--bg-base)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  accent: 'var(--accent)',
  teal: 'var(--accent-teal)',
  danger: '#ff4d4d',
  border: 'var(--border)',
  divider: 'var(--divider)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: DS.textMuted,
  fontFamily: 'Poppins, sans-serif', marginBottom: 20,
};

export default function DataSection() {
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // TODO: implement GET /api/export when backend route is ready
      await client.get('/export');
      flash('Export complete — check your downloads', true);
    } catch {
      flash('Export coming soon', false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '10px 18px', borderRadius: 8,
          background: toast.ok ? 'rgba(48,209,88,0.12)' : 'rgba(255,77,77,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(48,209,88,0.25)' : 'rgba(255,77,77,0.25)'}`,
          color: toast.ok ? DS.teal : DS.danger, fontSize: 13, fontWeight: 500,
        }}>{toast.msg}</div>
      )}

      <div style={sectionLabel}>Your data</div>

      {/* Export row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
        <div>
          <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Export data</div>
          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5 }}>
            Download all your tasks, folders, and lists as JSON
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: `1px solid ${DS.border}`,
            borderRadius: 8, color: DS.textSecondary, fontSize: 12, fontWeight: 500,
            padding: '7px 16px', cursor: exporting ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins, sans-serif', flexShrink: 0,
            opacity: exporting ? 0.6 : 1,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = DS.border)}
        >
          <Download size={13} />
          {exporting ? 'Exporting...' : 'Export JSON'}
        </button>
      </div>

      <div style={{ height: 1, background: DS.divider }} />

      {/* Import row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Import data</span>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'var(--border)', color: DS.textMuted,
              padding: '2px 7px', borderRadius: 4,
            }}>Coming soon</span>
          </div>
          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5 }}>
            Restore from a previous export
          </div>
        </div>
        <button
          disabled
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: `1px solid ${DS.divider}`,
            borderRadius: 8, color: DS.textMuted, fontSize: 12, fontWeight: 500,
            padding: '7px 16px', cursor: 'not-allowed',
            fontFamily: 'Poppins, sans-serif', flexShrink: 0, opacity: 0.5,
          }}
        >
          <Upload size={13} />
          Import file
        </button>
      </div>
    </div>
  );
}
