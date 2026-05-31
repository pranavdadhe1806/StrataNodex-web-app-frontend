import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, FolderClosed, FileText, Download, Loader2 } from 'lucide-react';
import { folderApi } from '../../api/folder.api';
import { listApi } from '../../api/list.api';
import { nodeApi } from '../../api/node.api';
import { buildTree } from '../../utils/tree';
import { computeNumbering } from '../../utils/numbering';
import { useThemeStore } from '../../store/theme.store';
import type { Folder } from '../../types/folder.types';
import type { List } from '../../types/list.types';
import type { Node } from '../../types/node.types';
import { jsPDF } from 'jspdf';

/* ─── Design tokens ────────────────────────────────────────── */
const DS = {
  bg: 'var(--bg-base)',
  surface: 'var(--bg-surface)',
  card: 'var(--bg-card)',
  elevated: 'var(--bg-elevated)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  accent: 'var(--accent)',
  teal: 'var(--accent-teal)',
  border: 'var(--border)',
  borderBright: 'var(--border-bright)',
  divider: 'var(--divider)',
};

/* ─── Styles ──────────────────────────────────────────────── */
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 300, backdropFilter: 'blur(4px)',
};

const modalStyle: React.CSSProperties = {
  background: DS.card,
  border: `1px solid ${DS.border}`,
  borderRadius: 16,
  boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
  width: 560, maxWidth: '92vw', maxHeight: '80vh',
  display: 'flex', flexDirection: 'column',
  fontFamily: 'var(--font-main)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '18px 24px', borderBottom: `1px solid ${DS.divider}`,
};

const bodyStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '20px 24px',
};

const footerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
  padding: '14px 24px', borderTop: `1px solid ${DS.divider}`,
};

const listItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 14px', borderRadius: 8,
  cursor: 'pointer', transition: 'background 0.12s',
  background: active ? 'rgba(36,119,198,0.1)' : 'transparent',
  border: active ? `1px solid ${DS.accent}` : '1px solid transparent',
});

const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 20px', borderRadius: 8,
  border: 'none', cursor: 'pointer',
  fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-main)',
  background: DS.accent, color: '#fff',
  transition: 'opacity 0.15s',
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  background: 'transparent',
  border: `1px solid ${DS.border}`,
  color: DS.textSecondary,
};

type ExportFormat = 'json' | 'pdf';
type Step = 'select' | 'format' | 'downloading';

/* ─── Helper: serialize tree for JSON export ─────────────── */
function serializeNodes(nodes: Node[]): object[] {
  return nodes.map(n => ({
    title: n.title,
    status: n.status,
    priority: n.priority,
    notes: n.notes,
    position: n.position,
    startAt: n.startAt,
    endAt: n.endAt,
    tags: n.tags?.map(t => ({ name: t.name, color: t.color })) ?? [],
    children: n.children?.length ? serializeNodes(n.children) : [],
  }));
}

/* ─── Helper: render tree to PDF ─────────────────────────── */
function renderTreePDF(listName: string, treeNodes: Node[], themeName: string) {
  const isDark = themeName !== 'white';

  // Colour palette
  const BG = isDark ? '#0A0A0A' : '#FFFFFF';
  const CARD_BG = isDark ? '#1C1C1E' : '#F2F2F7';
  const CARD_BORDER = isDark ? '#2C2C2E' : '#D1D1D6';
  const TEXT_PRIMARY = isDark ? '#FFFFFF' : '#1C1C1E';
  const TEXT_SECONDARY = isDark ? '#D1D1D6' : '#48484A';
  const TEXT_MUTED = isDark ? '#636366' : '#8E8E93';
  const ACCENT = '#2477C6';
  const TEAL = isDark ? '#30D158' : '#34C759';
  const CONNECTOR = isDark ? '#48484A' : '#C7C7CC';

  // Layout constants
  const PAGE_W = 210; // A4 mm
  const PAGE_H = 297;
  const MARGIN_X = 15;
  const MARGIN_TOP = 30;
  const CARD_H = 10;
  const CARD_PAD_X = 4;
  const ROW_GAP = 14;
  const DEPTH_INDENT = 18;
  const CARD_RADIUS = 3;
  const MAX_CARD_W = PAGE_W - MARGIN_X * 2 - 5;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  function fillPage() {
    doc.setFillColor(BG);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  }

  fillPage();

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(TEXT_PRIMARY);
  doc.text(listName, MARGIN_X, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED);
  doc.text(`Exported from StrataNodex  •  ${new Date().toLocaleDateString()}`, MARGIN_X, 24);

  // Flatten tree with depth info
  const flatList: { node: Node; depth: number; numbering: string }[] = [];
  const numbering = computeNumbering(treeNodes);

  function walk(nodes: Node[], depth: number) {
    for (const node of nodes) {
      flatList.push({ node, depth, numbering: numbering.get(node.id) || '' });
      if (node.children?.length) walk(node.children, depth + 1);
    }
  }
  walk(treeNodes, 0);

  let curY = MARGIN_TOP;

  // Draw connector lines between consecutive nodes
  function drawConnectors(startIdx: number, endIdx: number) {
    for (let i = startIdx; i <= endIdx; i++) {
      const item = flatList[i];
      // Find parent in previous items
      if (item.node.parentId) {
        for (let j = i - 1; j >= startIdx; j--) {
          if (flatList[j].node.id === item.node.parentId) {
            const parentX = MARGIN_X + flatList[j].depth * DEPTH_INDENT + 5;
            const parentY = MARGIN_TOP + (j - startIdx) * ROW_GAP + CARD_H;
            const childX = MARGIN_X + item.depth * DEPTH_INDENT;
            const childY = MARGIN_TOP + (i - startIdx) * ROW_GAP + CARD_H / 2;
            doc.setDrawColor(CONNECTOR);
            doc.setLineWidth(0.3);
            doc.line(parentX, parentY, parentX, childY);
            doc.line(parentX, childY, childX, childY);
            break;
          }
        }
      }
    }
  }

  // Render cards page by page
  let pageStartIdx = 0;

  for (let i = 0; i < flatList.length; i++) {
    const item = flatList[i];

    if (curY + CARD_H + 5 > PAGE_H - 15) {
      // Draw connectors for current page
      drawConnectors(pageStartIdx, i - 1);
      // New page
      doc.addPage();
      fillPage();
      curY = 15;
      pageStartIdx = i;
    }

    const x = MARGIN_X + item.depth * DEPTH_INDENT;
    const cardW = Math.min(MAX_CARD_W - item.depth * DEPTH_INDENT, 120);

    // Card background
    doc.setFillColor(CARD_BG);
    doc.setDrawColor(CARD_BORDER);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, curY, cardW, CARD_H, CARD_RADIUS, CARD_RADIUS, 'FD');

    // Status circle
    const circleX = x + CARD_PAD_X + 2.5;
    const circleY = curY + CARD_H / 2;
    if (item.node.status === 'DONE') {
      doc.setFillColor(TEAL);
      doc.circle(circleX, circleY, 2, 'F');
      // Checkmark
      doc.setDrawColor('#FFFFFF');
      doc.setLineWidth(0.4);
      doc.line(circleX - 0.8, circleY, circleX - 0.1, circleY + 0.7);
      doc.line(circleX - 0.1, circleY + 0.7, circleX + 1, circleY - 0.6);
    } else {
      doc.setDrawColor(TEXT_MUTED);
      doc.setLineWidth(0.3);
      doc.circle(circleX, circleY, 2);
    }

    // Numbering
    const textStartX = x + CARD_PAD_X + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(TEXT_MUTED);
    doc.text(item.numbering, textStartX, curY + CARD_H / 2 + 1);

    const numWidth = doc.getTextWidth(item.numbering) + 2;

    // Title
    doc.setFont('helvetica', item.node.status === 'DONE' ? 'normal' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(item.node.status === 'DONE' ? TEXT_MUTED : TEXT_SECONDARY);
    const maxTitleW = cardW - CARD_PAD_X * 2 - 8 - numWidth - 2;
    const titleLines = doc.splitTextToSize(item.node.title, maxTitleW);
    doc.text(titleLines[0] + (titleLines.length > 1 ? '...' : ''), textStartX + numWidth, curY + CARD_H / 2 + 1);

    // Priority indicator
    if (item.node.priority) {
      const prioColors: Record<string, string> = { HIGH: '#FF453A', MEDIUM: '#FFD60A', LOW: ACCENT };
      const prioColor = prioColors[item.node.priority] || ACCENT;
      doc.setFillColor(prioColor);
      doc.circle(x + cardW - 4, curY + 3, 1.2, 'F');
    }

    curY += ROW_GAP;
  }

  // Draw connectors for the last page
  drawConnectors(pageStartIdx, flatList.length - 1);

  // Footer on last page
  doc.setFontSize(7);
  doc.setTextColor(TEXT_MUTED);
  doc.text('StrataNodex', MARGIN_X, PAGE_H - 8);
  doc.text(`Page ${doc.getNumberOfPages()}`, PAGE_W - MARGIN_X - 15, PAGE_H - 8);

  doc.save(`${listName.replace(/[^a-zA-Z0-9_\- ]/g, '')}.pdf`);
}


/* ═══════════════════════════════════════════════════════════ */
/*  Component                                                  */
/* ═══════════════════════════════════════════════════════════ */
interface Props { open: boolean; onClose: () => void; }

export default function ExportModal({ open, onClose }: Props) {
  const { theme } = useThemeStore();

  // Data
  const [folders, setFolders] = useState<Folder[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);

  // Selection
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [format, setFormat] = useState<ExportFormat>('json');

  // Step
  const [step, setStep] = useState<Step>('select');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load folders on open
  useEffect(() => {
    if (!open) return;
    setLoadingFolders(true);
    setError(null);
    folderApi.getAll()
      .then(f => { setFolders(f); setLoadingFolders(false); })
      .catch(() => { setError('Failed to load folders'); setLoadingFolders(false); });
  }, [open]);

  // Load lists when folder selected
  useEffect(() => {
    if (!selectedFolder) { setLists([]); return; }
    setLoadingLists(true);
    setSelectedList(null);
    listApi.getByFolder(selectedFolder.id)
      .then(l => { setLists(l); setLoadingLists(false); })
      .catch(() => { setLoadingLists(false); });
  }, [selectedFolder]);

  // Reset on close
  const handleClose = useCallback(() => {
    setStep('select');
    setSelectedFolder(null);
    setSelectedList(null);
    setFormat('json');
    setError(null);
    onClose();
  }, [onClose]);

  // Export handler
  const handleExport = async () => {
    if (!selectedList || !selectedFolder) return;
    setDownloading(true);
    setStep('downloading');
    try {
      const rawNodes = await nodeApi.getByList(selectedList.id);
      const tree = buildTree(rawNodes);

      if (format === 'json') {
        const payload = {
          exportedAt: new Date().toISOString(),
          app: 'StrataNodex',
          folder: { name: selectedFolder.name },
          list: { name: selectedList.name },
          nodes: serializeNodes(tree),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedList.name.replace(/[^a-zA-Z0-9_\- ]/g, '')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        renderTreePDF(selectedList.name, tree, theme);
      }

      handleClose();
    } catch {
      setError('Export failed. Please try again.');
      setStep('format');
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: DS.textPrimary }}>Export data</div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>
              {step === 'select' ? 'Select a folder and list' : step === 'format' ? 'Choose export format' : 'Exporting...'}
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted, padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div style={{ display: 'flex', gap: 0, padding: '0 24px', paddingTop: 14 }}>
          {(['select', 'format'] as const).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
                background: step === s || (step === 'downloading' && s === 'format') || (step === 'format' && s === 'select')
                  ? DS.accent : DS.elevated,
                color: step === s || (step === 'downloading' && s === 'format') || (step === 'format' && s === 'select')
                  ? '#fff' : DS.textMuted,
                transition: 'all 0.2s',
              }}>
                {i + 1}
              </div>
              {i < 1 && (
                <div style={{
                  width: 40, height: 1,
                  background: step !== 'select' ? DS.accent : DS.divider,
                  transition: 'background 0.2s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={bodyStyle}>

          {error && (
            <div style={{
              padding: '8px 14px', borderRadius: 8, marginBottom: 14,
              background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)',
              color: '#FF453A', fontSize: 12,
            }}>{error}</div>
          )}

          {/* STEP 1: Folder & list selection */}
          {step === 'select' && (
            <div style={{ display: 'flex', gap: 16, minHeight: 260 }}>
              {/* Folders column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: DS.textMuted, marginBottom: 10 }}>
                  Folders
                </div>
                <div style={{
                  flex: 1, overflowY: 'auto', borderRadius: 10,
                  border: `1px solid ${DS.divider}`, padding: 6,
                  background: DS.bg,
                }}>
                  {loadingFolders ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                      <Loader2 size={18} style={{ color: DS.textMuted, animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : folders.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: DS.textMuted }}>
                      No folders found
                    </div>
                  ) : (
                    folders.map(f => (
                      <div
                        key={f.id}
                        style={listItemStyle(selectedFolder?.id === f.id)}
                        onClick={() => setSelectedFolder(f)}
                      >
                        <FolderClosed size={15} style={{ color: selectedFolder?.id === f.id ? DS.accent : DS.textMuted, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: selectedFolder?.id === f.id ? DS.accent : DS.textPrimary, fontWeight: selectedFolder?.id === f.id ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </span>
                        <ChevronRight size={12} style={{ marginLeft: 'auto', color: DS.textMuted, flexShrink: 0 }} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lists column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: DS.textMuted, marginBottom: 10 }}>
                  Lists
                </div>
                <div style={{
                  flex: 1, overflowY: 'auto', borderRadius: 10,
                  border: `1px solid ${DS.divider}`, padding: 6,
                  background: DS.bg,
                }}>
                  {!selectedFolder ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: DS.textMuted }}>
                      Select a folder
                    </div>
                  ) : loadingLists ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                      <Loader2 size={18} style={{ color: DS.textMuted, animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : lists.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: DS.textMuted }}>
                      No lists in this folder
                    </div>
                  ) : (
                    lists.map(l => (
                      <div
                        key={l.id}
                        style={listItemStyle(selectedList?.id === l.id)}
                        onClick={() => setSelectedList(l)}
                      >
                        <FileText size={15} style={{ color: selectedList?.id === l.id ? DS.accent : DS.textMuted, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: selectedList?.id === l.id ? DS.accent : DS.textPrimary, fontWeight: selectedList?.id === l.id ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.name}
                        </span>
                        {l._count && (
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: DS.textMuted, flexShrink: 0 }}>
                            {l._count.nodes}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Format selection */}
          {step === 'format' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: DS.textMuted, marginBottom: 4 }}>
                Exporting <span style={{ color: DS.accent, fontWeight: 500 }}>{selectedList?.name}</span> from <span style={{ color: DS.textSecondary, fontWeight: 500 }}>{selectedFolder?.name}</span>
              </div>
              {([
                { id: 'json' as const, label: 'JSON', desc: 'Structured data file — can be re-imported later' },
                { id: 'pdf' as const, label: 'PDF', desc: 'Visual tree layout for viewing and sharing' },
              ]).map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                    border: format === opt.id ? `1px solid ${DS.accent}` : `1px solid ${DS.divider}`,
                    background: format === opt.id ? 'rgba(36,119,198,0.06)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Radio circle */}
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: format === opt.id ? `5px solid ${DS.accent}` : `2px solid ${DS.textMuted}`,
                    background: format === opt.id ? '#fff' : 'transparent',
                    transition: 'all 0.15s',
                    boxSizing: 'border-box',
                  }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: DS.textPrimary }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Downloading */}
          {step === 'downloading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0', gap: 14 }}>
              <Loader2 size={28} style={{ color: DS.accent, animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13, color: DS.textMuted }}>Preparing your {format.toUpperCase()} file...</div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {step !== 'downloading' && (
          <div style={footerStyle}>
            {step === 'format' && (
              <button style={btnSecondary} onClick={() => setStep('select')}>
                Back
              </button>
            )}
            {step === 'select' && (
              <button
                style={{ ...btnPrimary, opacity: selectedList ? 1 : 0.4, cursor: selectedList ? 'pointer' : 'not-allowed' }}
                disabled={!selectedList}
                onClick={() => setStep('format')}
              >
                Next
                <ChevronRight size={14} />
              </button>
            )}
            {step === 'format' && (
              <button style={btnPrimary} onClick={handleExport} disabled={downloading}>
                <Download size={14} />
                Export {format.toUpperCase()}
              </button>
            )}
          </div>
        )}
      </div>

      {/* spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
