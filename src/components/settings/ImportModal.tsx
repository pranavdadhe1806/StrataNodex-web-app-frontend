import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Plus, FolderClosed, FileText, Check, Loader2, AlertCircle } from 'lucide-react';
import { folderApi } from '../../api/folder.api';
import { listApi } from '../../api/list.api';
import { nodeApi } from '../../api/node.api';
import type { Folder } from '../../types/folder.types';

/* ─── Design tokens ────────────────────────────────────────── */
const DS = {
  bg: 'var(--bg-base)',
  card: 'var(--bg-card)',
  elevated: 'var(--bg-elevated)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  accent: 'var(--accent)',
  teal: 'var(--accent-teal)',
  danger: '#FF453A',
  border: 'var(--border)',
  divider: 'var(--divider)',
};

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
  width: 480, maxWidth: '92vw', maxHeight: '80vh',
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

const listItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 14px', borderRadius: 8,
  cursor: 'pointer', transition: 'background 0.12s',
  background: active ? 'rgba(36,119,198,0.1)' : 'transparent',
  border: active ? `1px solid ${DS.accent}` : '1px solid transparent',
});

/* ─── Validation types ─────────────────────────────────────── */
interface ImportNode {
  title: string;
  status?: string;
  priority?: string | null;
  notes?: string | null;
  position?: number;
  startAt?: string | null;
  endAt?: string | null;
  tags?: { name: string; color?: string }[];
  children?: ImportNode[];
}

interface ImportPayload {
  app?: string;
  folder?: { name: string };
  list: { name: string };
  nodes: ImportNode[];
}

function countNodes(nodes: ImportNode[]): number {
  let c = 0;
  for (const n of nodes) {
    c += 1;
    if (n.children?.length) c += countNodes(n.children);
  }
  return c;
}

function validatePayload(data: unknown): ImportPayload | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (!obj.list || typeof obj.list !== 'object') return null;
  const list = obj.list as Record<string, unknown>;
  if (!list.name || typeof list.name !== 'string') return null;
  if (!Array.isArray(obj.nodes)) return null;
  return data as ImportPayload;
}

type Step = 'upload' | 'destination' | 'importing' | 'done';

/* ═══════════════════════════════════════════════════════════ */
/*  Component                                                  */
/* ═══════════════════════════════════════════════════════════ */
interface Props { open: boolean; onClose: () => void; }

export default function ImportModal({ open, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [payload, setPayload] = useState<ImportPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Destination state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  // Import state
  const [step, setStep] = useState<Step>('upload');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load folders when reaching destination step
  useEffect(() => {
    if (step !== 'destination') return;
    setLoadingFolders(true);
    folderApi.getAll()
      .then(f => { setFolders(f); setLoadingFolders(false); })
      .catch(() => { setError('Failed to load folders'); setLoadingFolders(false); });
  }, [step]);

  // Auto-focus new folder input
  useEffect(() => {
    if (creatingFolder) newFolderInputRef.current?.focus();
  }, [creatingFolder]);

  // Reset
  const handleClose = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPayload(null);
    setParseError(null);
    setDragOver(false);
    setSelectedFolderId(null);
    setCreatingFolder(false);
    setNewFolderName('');
    setError(null);
    setImporting(false);
    onClose();
  }, [onClose]);

  // Parse file
  const processFile = useCallback((f: File) => {
    setParseError(null);
    setFile(f);

    if (!f.name.endsWith('.json')) {
      setParseError('Only .json files are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const validated = validatePayload(data);
        if (!validated) {
          setParseError('Invalid file structure. Expected a StrataNodex export with "list" and "nodes" fields.');
          return;
        }
        setPayload(validated);
      } catch {
        setParseError('Failed to parse JSON. The file may be corrupted.');
      }
    };
    reader.readAsText(f);
  }, []);

  // Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const created = await folderApi.create({ name: newFolderName.trim() });
      setFolders(prev => [...prev, created]);
      setSelectedFolderId(created.id);
      setCreatingFolder(false);
      setNewFolderName('');
    } catch {
      setError('Failed to create folder');
    }
  };

  // Import handler
  const handleImport = async () => {
    if (!payload || !selectedFolderId) return;
    setImporting(true);
    setStep('importing');
    setError(null);

    try {
      // Create the list
      setImportProgress('Creating list...');
      const createdList = await listApi.create({
        name: payload.list.name,
        folderId: selectedFolderId,
      });

      // Create nodes recursively
      const totalNodes = countNodes(payload.nodes);
      let created = 0;

      async function createNodes(nodes: ImportNode[], parentId: string | null) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          created++;
          setImportProgress(`Creating node ${created} of ${totalNodes}...`);

          let createdNode;
          if (parentId) {
            createdNode = await nodeApi.createChild(parentId, {
              title: n.title,
              status: (n.status as 'TODO' | 'IN_PROGRESS' | 'DONE') || 'TODO',
              priority: (n.priority as 'LOW' | 'MEDIUM' | 'HIGH' | undefined) || undefined,
              notes: n.notes || undefined,
              position: i,
              startAt: n.startAt || undefined,
              endAt: n.endAt || undefined,
            });
          } else {
            createdNode = await nodeApi.create(createdList.id, {
              title: n.title,
              listId: createdList.id,
              status: (n.status as 'TODO' | 'IN_PROGRESS' | 'DONE') || 'TODO',
              priority: (n.priority as 'LOW' | 'MEDIUM' | 'HIGH' | undefined) || undefined,
              notes: n.notes || undefined,
              position: i,
              startAt: n.startAt || undefined,
              endAt: n.endAt || undefined,
            });
          }

          if (n.children?.length && createdNode) {
            await createNodes(n.children, createdNode.id);
          }
        }
      }

      await createNodes(payload.nodes, null);
      setStep('done');
    } catch {
      setError('Import failed. Some nodes may have been partially created.');
      setStep('destination');
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: DS.textPrimary }}>Import data</div>
            <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>
              {step === 'upload' ? 'Upload a StrataNodex JSON file'
                : step === 'destination' ? 'Choose where to import'
                : step === 'importing' ? 'Importing...'
                : 'Import complete'}
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
        {step !== 'done' && (
          <div style={{ display: 'flex', gap: 0, padding: '0 24px', paddingTop: 14 }}>
            {(['upload', 'destination'] as const).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600,
                  background: (step === s || (step === 'importing' && s === 'destination') ||
                    (step === 'destination' && s === 'upload')) ? DS.accent : DS.elevated,
                  color: (step === s || (step === 'importing' && s === 'destination') ||
                    (step === 'destination' && s === 'upload')) ? '#fff' : DS.textMuted,
                  transition: 'all 0.2s',
                }}>
                  {i + 1}
                </div>
                {i < 1 && (
                  <div style={{
                    width: 40, height: 1,
                    background: step !== 'upload' ? DS.accent : DS.divider,
                    transition: 'background 0.2s',
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div style={bodyStyle}>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 8, marginBottom: 14,
              background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)',
              color: DS.danger, fontSize: 12,
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div>
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 12, padding: '40px 20px', borderRadius: 12, cursor: 'pointer',
                  border: `2px dashed ${dragOver ? DS.accent : parseError ? DS.danger : DS.divider}`,
                  background: dragOver ? 'rgba(36,119,198,0.04)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {file && payload ? (
                  <>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={20} style={{ color: DS.teal }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: DS.textPrimary }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>
                        List: {payload.list.name} — {countNodes(payload.nodes)} nodes
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: DS.textMuted }}>Click to choose a different file</div>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: DS.elevated,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Plus size={20} style={{ color: DS.textMuted }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: DS.textSecondary }}>
                        Drag and drop a JSON file here
                      </div>
                      <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>
                        or click to browse
                      </div>
                    </div>
                  </>
                )}
              </div>

              {parseError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 8, marginTop: 12,
                  background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)',
                  color: DS.danger, fontSize: 12,
                }}>
                  <AlertCircle size={14} />
                  {parseError}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* STEP 2: Destination */}
          {step === 'destination' && (
            <div>
              <div style={{ fontSize: 12, color: DS.textMuted, marginBottom: 14 }}>
                Importing <span style={{ color: DS.accent, fontWeight: 500 }}>{payload?.list.name}</span> — choose a destination folder
              </div>

              <div style={{
                borderRadius: 10, border: `1px solid ${DS.divider}`,
                padding: 6, background: DS.bg, maxHeight: 240, overflowY: 'auto',
              }}>
                {loadingFolders ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                    <Loader2 size={18} style={{ color: DS.textMuted, animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <>
                    {folders.map(f => (
                      <div
                        key={f.id}
                        style={listItemStyle(selectedFolderId === f.id)}
                        onClick={() => setSelectedFolderId(f.id)}
                      >
                        <FolderClosed size={15} style={{ color: selectedFolderId === f.id ? DS.accent : DS.textMuted, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: selectedFolderId === f.id ? DS.accent : DS.textPrimary, fontWeight: selectedFolderId === f.id ? 500 : 400 }}>
                          {f.name}
                        </span>
                        {selectedFolderId === f.id && (
                          <Check size={14} style={{ marginLeft: 'auto', color: DS.accent }} />
                        )}
                      </div>
                    ))}

                    {/* Create new folder */}
                    {creatingFolder ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px' }}>
                        <FolderClosed size={15} style={{ color: DS.accent, flexShrink: 0 }} />
                        <input
                          ref={newFolderInputRef}
                          value={newFolderName}
                          onChange={e => setNewFolderName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleCreateFolder();
                            if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); }
                          }}
                          placeholder="Folder name..."
                          style={{
                            flex: 1, background: 'transparent', border: 'none',
                            borderBottom: `1px solid ${DS.accent}`,
                            outline: 'none', color: DS.textPrimary,
                            fontSize: 13, fontFamily: 'var(--font-main)',
                            padding: '4px 0',
                          }}
                        />
                        <button
                          onClick={handleCreateFolder}
                          disabled={!newFolderName.trim()}
                          style={{
                            background: DS.accent, border: 'none', borderRadius: 6,
                            color: '#fff', padding: '4px 10px', fontSize: 12, fontWeight: 500,
                            cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                            opacity: newFolderName.trim() ? 1 : 0.4,
                            fontFamily: 'var(--font-main)',
                          }}
                        >
                          Create
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                          borderTop: `1px solid ${DS.divider}`, marginTop: 4,
                          transition: 'background 0.12s',
                        }}
                        onClick={() => setCreatingFolder(true)}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Plus size={15} style={{ color: DS.accent }} />
                        <span style={{ fontSize: 13, color: DS.accent, fontWeight: 500 }}>New folder</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Importing */}
          {step === 'importing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0', gap: 14 }}>
              <Loader2 size={28} style={{ color: DS.accent, animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13, color: DS.textMuted }}>{importProgress}</div>
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={24} style={{ color: DS.teal }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: DS.textPrimary }}>Import complete</div>
              <div style={{ fontSize: 12, color: DS.textMuted }}>
                {payload?.list.name} — {payload ? countNodes(payload.nodes) : 0} nodes imported
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {step !== 'importing' && (
          <div style={footerStyle}>
            {step === 'destination' && (
              <button style={btnSecondary} onClick={() => setStep('upload')}>
                Back
              </button>
            )}
            {step === 'upload' && (
              <button
                style={{ ...btnPrimary, opacity: payload ? 1 : 0.4, cursor: payload ? 'pointer' : 'not-allowed' }}
                disabled={!payload}
                onClick={() => setStep('destination')}
              >
                Next
                <FileText size={14} />
              </button>
            )}
            {step === 'destination' && (
              <button
                style={{ ...btnPrimary, opacity: selectedFolderId ? 1 : 0.4, cursor: selectedFolderId ? 'pointer' : 'not-allowed' }}
                disabled={!selectedFolderId || importing}
                onClick={handleImport}
              >
                <Upload size={14} />
                Import
              </button>
            )}
            {step === 'done' && (
              <button style={btnPrimary} onClick={handleClose}>
                Done
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
