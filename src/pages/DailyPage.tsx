import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import { useDailyList, useRemoveFromDaily } from '../hooks/useDaily';
import { useUpdateNode, useCreateNode, useCreateSubNode } from '../hooks/useNodes';
import type { Node } from '../types/node.types';

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function StatusCircle({ status, onClick }: { status: Node['status']; onClick: () => void }) {
  const colors: Record<Node['status'], string> = {
    TODO: 'transparent',
    IN_PROGRESS: 'rgba(36,119,198,0.5)',
    DONE: 'var(--accent-teal)',
  };
  const borders: Record<Node['status'], string> = {
    TODO: '1.5px solid var(--text-muted)',
    IN_PROGRESS: '1.5px solid rgba(36,119,198,0.75)',
    DONE: 'none',
  };
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        background: colors[status], border: borders[status],
        cursor: 'pointer', transition: 'all 0.15s ease',
      }}
    />
  );
}

function DailyNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  const updateNode = useUpdateNode();
  const removeFromDaily = useRemoveFromDaily();

  const cycleStatus = () => {
    const next: Record<Node['status'], Node['status']> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' };
    updateNode.mutate({ id: node.id, data: { status: next[node.status] } });
  };

  const isRef = !!node.sourceNodeId;
  const isDone = node.status === 'DONE';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 16px',
        marginLeft: depth > 0 ? `${depth * 20}px` : 0,
        background: depth === 0 ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: '1px solid var(--divider)',
        borderRadius: '10px', transition: 'border-color 0.15s ease',
      }}>
        <StatusCircle status={node.status} onClick={cycleStatus} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: isDone ? 'var(--text-muted)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-main)', fontSize: depth === 0 ? '14px' : '13px',
            textDecoration: isDone ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {node.title}
          </div>
          {isRef && node.source && (
            <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ExternalLink size={10} />
              {node.source.list.name}
            </div>
          )}
        </div>

        {depth === 0 && (
          <button
            onClick={() => removeFromDaily.mutate(node.id)}
            style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-placeholder)', display: 'flex', alignItems: 'center', opacity: 0.6, transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            title="Remove from daily"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Render children recursively */}
      {(node.children ?? []).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
          {(node.children ?? []).map(child => (
            <DailyNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DailyPage() {
  const { data, isLoading } = useDailyList();
  const createNodeMutation = useCreateNode();
  const createSubNodeMutation = useCreateSubNode();

  // ── Inline-add state (mirrors ListPage) ───────────────────────────────────
  const [isTyping, setIsTyping] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDepth, setCurrentDepth] = useState(0);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [lastCreatedNodeId, setLastCreatedNodeId] = useState<string | null>(null);
  const [localNodes, setLocalNodes] = useState<Node[]>([]);

  // Promise map so sub-nodes always get the real server parent ID
  const idPromises = useRef<Map<string, Promise<string>>>(new Map());

  const nodes = data?.nodes ?? [];
  const dailyListId = data?.list?.id ?? '';

  // Sync server nodes into local state (but don't blow away optimistic nodes mid-flight)
  useEffect(() => {
    if (!isTyping) setLocalNodes(nodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Flatten tree for progress counting
  const flattenNodes = (list: Node[]): Node[] =>
    list.flatMap(n => [n, ...flattenNodes(n.children ?? [])]);
  const allNodes = flattenNodes(localNodes);
  const done = allNodes.filter(n => n.status === 'DONE').length;
  const total = allNodes.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // ── Tree helpers ──────────────────────────────────────────────────────────
  function addNodeToTree(tree: Node[], newNode: Node, parentId: string | null): Node[] {
    if (parentId === null) return [...tree, newNode];
    return tree.map(node => {
      if (node.id === parentId) {
        return { ...node, children: [...(node.children ?? []), newNode] };
      }
      return { ...node, children: addNodeToTree(node.children ?? [], newNode, parentId) };
    });
  }

  function replaceTempId(tree: Node[], tempId: string, realId: string): Node[] {
    return tree.map(node => {
      const updatedChildren = replaceTempId(node.children ?? [], tempId, realId);
      if (node.id === tempId) return { ...node, id: realId, listId: dailyListId, children: updatedChildren };
      if (node.parentId === tempId) return { ...node, parentId: realId, children: updatedChildren };
      return { ...node, children: updatedChildren };
    });
  }

  function findParentAtDepth(tree: Node[], targetDepth: number, depth: number = 0): string | null {
    if (targetDepth === 0) return null;
    for (let i = tree.length - 1; i >= 0; i--) {
      const node = tree[i];
      if (depth === targetDepth - 1) return node.id;
      if (node.children?.length > 0) {
        const found = findParentAtDepth(node.children, targetDepth, depth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  function computePosition(tree: Node[], parentId: string | null): number {
    if (parentId === null) return tree.length;
    const findParent = (list: Node[]): Node | null => {
      for (const node of list) {
        if (node.id === parentId) return node;
        const found = findParent(node.children ?? []);
        if (found) return found;
      }
      return null;
    };
    const parent = findParent(tree);
    return parent ? (parent.children?.length ?? 0) : 0;
  }

  // ── Create node (optimistic) ──────────────────────────────────────────────
  const createNode = useCallback((title: string) => {
    if (!dailyListId) return;

    const tempId = crypto.randomUUID();
    const position = computePosition(localNodes, currentParentId);

    const newNode: Node = {
      id: tempId,
      title,
      status: 'TODO',
      priority: 'MEDIUM',
      notes: null,
      startAt: null,
      endAt: null,
      reminderAt: null,
      canvasX: null,
      canvasY: null,
      position,
      listId: dailyListId,
      parentId: currentParentId,
      sourceNodeId: null,
      source: null,
      children: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocalNodes(prev => addNodeToTree(prev, newNode, currentParentId));
    setLastCreatedNodeId(tempId);

    // Promise so nested sub-nodes wait for the real parent ID
    let resolveRealId!: (id: string) => void;
    let rejectRealId!: (e: unknown) => void;
    const realIdPromise = new Promise<string>((res, rej) => {
      resolveRealId = res;
      rejectRealId = rej;
    });
    idPromises.current.set(tempId, realIdPromise);

    const onSaved = (savedId: string) => {
      resolveRealId(savedId);
      setLocalNodes(prev => replaceTempId(prev, tempId, savedId));
      setLastCreatedNodeId(prev => (prev === tempId ? savedId : prev));
      setCurrentParentId(prev => (prev === tempId ? savedId : prev));
    };

    const rollback = (e: unknown) => {
      console.error('Failed to save node', e);
      rejectRealId(e);
      idPromises.current.delete(tempId);
      setLocalNodes(prev => {
        const remove = (tree: Node[]): Node[] =>
          tree.filter(n => n.id !== tempId).map(n => ({ ...n, children: remove(n.children ?? []) }));
        return remove(prev);
      });
    };

    const saveToServer = async () => {
      if (currentParentId === null) {
        const saved = await createNodeMutation.mutateAsync({
          listId: dailyListId,
          data: { title, listId: dailyListId, position },
        });
        onSaved(saved.id);
      } else {
        const parentPromise = idPromises.current.get(currentParentId);
        const realParentId = parentPromise ? await parentPromise : currentParentId;
        const saved = await createSubNodeMutation.mutateAsync({
          parentId: realParentId,
          data: { title, position },
        });
        onSaved(saved.id);
      }
    };

    saveToServer().catch(rollback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyListId, localNodes, currentParentId]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!currentInput.trim()) return;
      createNode(currentInput.trim());
      setCurrentInput('');
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: dedent
        if (currentDepth > 0) {
          const newDepth = currentDepth - 1;
          setCurrentDepth(newDepth);
          setCurrentParentId(findParentAtDepth(localNodes, newDepth));
        }
      } else {
        // Tab: indent one level deeper under the last created node
        const newDepth = currentDepth + 1;
        setCurrentDepth(newDepth);
        setCurrentParentId(lastCreatedNodeId ?? findParentAtDepth(localNodes, newDepth));
      }
    }

    if (e.key === 'Escape') {
      setIsTyping(false);
      setCurrentInput('');
      setCurrentDepth(0);
      setCurrentParentId(null);
      setLastCreatedNodeId(null);
    }

    if (e.key === 'Backspace') {
      const ta = e.target as HTMLTextAreaElement;
      if (ta.selectionStart === 0 && ta.selectionEnd === 0 && currentDepth > 0) {
        e.preventDefault();
        const newDepth = currentDepth - 1;
        setCurrentDepth(newDepth);
        setCurrentParentId(findParentAtDepth(localNodes, newDepth));
      }
    }
  }

  // ── Depth indicator (mirrors ListPage bullet style) ────────────────────────
  const DEPTH_COLORS = ['var(--accent)', '#00bfff', '#00c896', '#f7b955', '#f85149'];
  const depthColor = DEPTH_COLORS[Math.min(currentDepth, DEPTH_COLORS.length - 1)];
  const depthLabel = currentDepth === 0 ? 'root task' : `sub-task (depth ${currentDepth})`;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Topbar title="Today" />
      <SidePanel />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 48px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', fontSize: '24px', fontWeight: 600, margin: 0 }}>
            Daily Task List
          </h1>
          <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '13px', marginTop: '4px' }}>
            {today}
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-main)', fontSize: '12px' }}>
                {done} / {total} tasks complete
              </span>
              <span style={{ color: pct >= 90 ? 'var(--accent-teal)' : pct >= 60 ? 'rgba(36,119,198,0.9)' : 'var(--text-muted)', fontFamily: 'var(--font-main)', fontSize: '12px', fontWeight: 600 }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--divider)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: pct >= 90 ? 'var(--accent-teal)' : pct >= 60 ? 'rgba(36,119,198,0.8)' : 'rgba(36,119,198,0.4)',
                width: `${pct}%`, transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Task list */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
          {isLoading ? (
            <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
              Loading…
            </div>
          ) : localNodes.length === 0 && !isTyping ? (
            <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
              No tasks yet — add one below or pin tasks from any list
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {localNodes.map(node => (
                <DailyNode key={node.id} node={node} />
              ))}
            </div>
          )}

          {/* ── Inline add ── */}
          {isTyping ? (
            <div style={{ marginTop: localNodes.length > 0 ? '12px' : '0' }}>
              {/* Depth indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', paddingLeft: `${currentDepth * 20}px` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: depthColor, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '11px' }}>
                  {depthLabel} · Tab to indent · Shift+Tab to dedent · Enter to add · Esc to cancel
                </span>
              </div>

              {/* Textarea input */}
              <div style={{ paddingLeft: `${currentDepth * 20}px`, display: 'flex', gap: '8px' }}>
                <textarea
                  autoFocus
                  rows={1}
                  value={currentInput}
                  onChange={e => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Task title…"
                  style={{
                    flex: 1, resize: 'none', overflow: 'hidden',
                    background: 'var(--bg-card)', border: `1px solid ${depthColor}44`,
                    borderRadius: '8px', padding: '8px 12px',
                    color: 'var(--text-secondary)', fontFamily: 'var(--font-main)',
                    fontSize: '13px', outline: 'none', lineHeight: '1.4',
                    boxShadow: `0 0 0 2px ${depthColor}22`,
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setIsTyping(true); setLocalNodes(nodes); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: localNodes.length > 0 ? '10px' : '0', background: 'none', border: 'none', color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '13px', cursor: 'pointer', padding: '4px 0' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-placeholder)')}
            >
              <Plus size={14} /> Add task
            </button>
          )}
        </div>

        <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '12px', textAlign: 'center' }}>
          Pin tasks from any list using the <strong style={{ color: 'var(--text-muted)' }}>Add to Daily</strong> button in the task detail panel
        </div>
      </div>
    </div>
  );
}
