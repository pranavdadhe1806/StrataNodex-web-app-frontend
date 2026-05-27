import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import { useDailyList, useRemoveFromDaily } from '../hooks/useDaily';
import { useUpdateNode, useCreateNode } from '../hooks/useNodes';
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

function DailyNode({ node }: { node: Node }) {
  const updateNode = useUpdateNode();
  const removeFromDaily = useRemoveFromDaily();

  const cycleStatus = () => {
    const next: Record<Node['status'], Node['status']> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' };
    updateNode.mutate({ id: node.id, data: { status: next[node.status] } });
  };

  const isRef = !!node.sourceNodeId;
  const isDone = node.status === 'DONE';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px', background: 'var(--bg-elevated)',
      border: '1px solid var(--divider)',
      borderRadius: '10px', transition: 'border-color 0.15s ease',
    }}>
      <StatusCircle status={node.status} onClick={cycleStatus} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: isDone ? 'var(--text-muted)' : 'var(--text-secondary)',
          fontFamily: 'Poppins, sans-serif', fontSize: '14px',
          textDecoration: isDone ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {node.title}
        </div>
        {isRef && node.source && (
          <div style={{ color: 'var(--text-placeholder)', fontFamily: 'Poppins, sans-serif', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ExternalLink size={10} />
            {node.source.list.name}
          </div>
        )}
      </div>

      <button
        onClick={() => removeFromDaily.mutate(node.id)}
        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-placeholder)', display: 'flex', alignItems: 'center', opacity: 0.6, transition: 'opacity 0.15s' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
        title="Remove from daily"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function DailyPage() {
  const { data, isLoading } = useDailyList();
  const createNode = useCreateNode();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const nodes = data?.nodes ?? [];
  const dailyListId = data?.list?.id ?? '';
  const done = nodes.filter(n => n.status === 'DONE').length;
  const total = nodes.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAddTask = () => {
    if (!newTitle.trim() || !dailyListId) return;
    createNode.mutate({ listId: dailyListId, data: { title: newTitle.trim(), listId: dailyListId, status: 'TODO', priority: 'MEDIUM' } });
    setNewTitle('');
    setAdding(false);
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Topbar title="Today" />
      <SidePanel />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 48px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: 'var(--text-secondary)', fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 600, margin: 0 }}>
            Daily Task List
          </h1>
          <div style={{ color: 'var(--text-placeholder)', fontFamily: 'Poppins, sans-serif', fontSize: '13px', marginTop: '4px' }}>
            {today}
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                {done} / {total} tasks complete
              </span>
              <span style={{ color: pct >= 90 ? 'var(--accent-teal)' : pct >= 60 ? 'rgba(36,119,198,0.9)' : 'var(--text-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600 }}>
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
            <div style={{ color: 'var(--text-placeholder)', fontFamily: 'Poppins, sans-serif', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
              Loading…
            </div>
          ) : nodes.length === 0 && !adding ? (
            <div style={{ color: 'var(--text-placeholder)', fontFamily: 'Poppins, sans-serif', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
              No tasks yet — add one below or pin tasks from any list
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nodes.map(node => (
                <DailyNode key={node.id} node={node} />
              ))}
            </div>
          )}

          {/* Inline add */}
          {adding ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: nodes.length > 0 ? '10px' : '0' }}>
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setAdding(false); }}
                placeholder="Task title…"
                style={{
                  flex: 1, background: 'var(--bg-card)', border: '1px solid rgba(36,119,198,0.3)',
                  borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)',
                  fontFamily: 'Poppins, sans-serif', fontSize: '13px', outline: 'none',
                }}
              />
              <button onClick={handleAddTask} style={{ background: 'rgba(36,119,198,0.15)', border: '1px solid rgba(36,119,198,0.3)', borderRadius: '8px', padding: '8px 14px', color: 'var(--accent)', fontFamily: 'Poppins, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
                Add
              </button>
              <button onClick={() => setAdding(false)} style={{ background: 'var(--divider)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px', color: 'var(--text-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: nodes.length > 0 ? '10px' : '0', background: 'none', border: 'none', color: 'var(--text-placeholder)', fontFamily: 'Poppins, sans-serif', fontSize: '13px', cursor: 'pointer', padding: '4px 0' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-placeholder)')}
            >
              <Plus size={14} /> Add task
            </button>
          )}
        </div>

        <div style={{ color: 'var(--text-placeholder)', fontFamily: 'Poppins, sans-serif', fontSize: '12px', textAlign: 'center' }}>
          Pin tasks from any list using the <strong style={{ color: 'var(--text-muted)' }}>Add to Daily</strong> button in the task detail panel
        </div>
      </div>
    </div>
  );
}
