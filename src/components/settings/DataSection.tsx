import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import ExportModal from './ExportModal';
import ImportModal from './ImportModal';

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
  fontFamily: 'var(--font-main)', marginBottom: 20,
};

export default function DataSection() {
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      <div style={sectionLabel}>Your data</div>

      {/* Export row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
        <div>
          <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Export data</div>
          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5 }}>
            Download a folder's list as JSON or PDF
          </div>
        </div>
        <button
          onClick={() => setExportOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: `1px solid ${DS.border}`,
            borderRadius: 8, color: DS.textSecondary, fontSize: 12, fontWeight: 500,
            padding: '7px 16px', cursor: 'pointer',
            fontFamily: 'var(--font-main)', flexShrink: 0,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = DS.border)}
        >
          <Download size={13} />
          Export
        </button>
      </div>

      <div style={{ height: 1, background: DS.divider }} />

      {/* Import row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
        <div>
          <div style={{ fontSize: 13, color: DS.textPrimary, fontWeight: 500 }}>Import data</div>
          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3, lineHeight: 1.5 }}>
            Restore from a previous export
          </div>
        </div>
        <button
          onClick={() => setImportOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: `1px solid ${DS.border}`,
            borderRadius: 8, color: DS.textSecondary, fontSize: 12, fontWeight: 500,
            padding: '7px 16px', cursor: 'pointer',
            fontFamily: 'var(--font-main)', flexShrink: 0,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = DS.border)}
        >
          <Upload size={13} />
          Import
        </button>
      </div>

      {/* Modals */}
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
