import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Node, NodeStatus, Priority } from '../../types/node.types';

interface NodeDetailPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (updated: Node) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
}

const fieldInputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  color: '#EDEFF3',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '13px',
  padding: '8px 12px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'dark' as React.CSSProperties['colorScheme'],
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'Poppins, sans-serif',
  fontSize: '11px',
  color: '#7D828B',
  fontWeight: 500,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'block',
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(0, 191, 255, 0.4)';
}
function handleBlurReset(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
}

export default function NodeDetailPanel({ node, onClose, onUpdate, onDelete, onAddSubtask }: NodeDetailPanelProps) {
  const [localTitle, setLocalTitle] = useState(node.title);
  const [localStatus, setLocalStatus] = useState<NodeStatus>(node.status);
  const [localPriority, setLocalPriority] = useState<Priority | ''>(node.priority ?? '');
  const [localStartDate, setLocalStartDate] = useState(node.startAt?.split('T')[0] ?? '');
  const [localStartTime, setLocalStartTime] = useState(node.startAt ? (node.startAt.split('T')[1]?.slice(0, 5) ?? '') : '');
  const [localEndDate, setLocalEndDate] = useState(node.endAt?.split('T')[0] ?? '');
  const [localEndTime, setLocalEndTime] = useState(node.endAt ? (node.endAt.split('T')[1]?.slice(0, 5) ?? '') : '');
  const [localNotes, setLocalNotes] = useState(node.notes ?? '');
  const [localTags, setLocalTags] = useState<string[]>(node.tags?.map(t => t.name) ?? []);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setLocalTitle(node.title);
    setLocalStatus(node.status);
    setLocalPriority(node.priority ?? '');
    setLocalNotes(node.notes ?? '');
    setLocalTags(node.tags?.map(t => t.name) ?? []);
    setLocalStartDate(node.startAt?.split('T')[0] ?? '');
    setLocalStartTime(node.startAt ? (node.startAt.split('T')[1]?.slice(0, 5) ?? '') : '');
    setLocalEndDate(node.endAt?.split('T')[0] ?? '');
    setLocalEndTime(node.endAt ? (node.endAt.split('T')[1]?.slice(0, 5) ?? '') : '');
  }, [node.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function buildDateTimeString(date: string, time: string): string | null {
    if (!date) return null;
    return time ? `${date}T${time}:00.000Z` : `${date}T00:00:00.000Z`;
  }

  function handleStatusChange(status: NodeStatus) {
    setLocalStatus(status);
    onUpdate({ ...node, status });
  }

  function handlePriorityChange(priority: Priority | '') {
    setLocalPriority(priority);
    onUpdate({ ...node, priority: priority || null });
  }

  function handleTitleBlur() {
    if (localTitle.trim() && localTitle !== node.title) {
      onUpdate({ ...node, title: localTitle.trim() });
    }
  }

  function handleNotesBlur() {
    if (localNotes !== node.notes) {
      onUpdate({ ...node, notes: localNotes });
    }
  }

  function handleDateTimeBlur() {
    const startAt = buildDateTimeString(localStartDate, localStartTime);
    const endAt = buildDateTimeString(localEndDate, localEndTime);
    onUpdate({ ...node, startAt, endAt });
  }

  function addTag() {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed || localTags.includes(trimmed)) return;
    const next = [...localTags, trimmed];
    setLocalTags(next);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setLocalTags(prev => prev.filter(t => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && tagInput === '' && localTags.length > 0) {
      setLocalTags(prev => prev.slice(0, -1));
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 29, 33, 0.85)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          width: '480px',
          maxHeight: '580px',
          borderRadius: '16px',
          background: '#32363C',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <input
            value={localTitle}
            onChange={e => setLocalTitle(e.target.value)}
            onBlur={e => { handleTitleBlur(); e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)'; }}
            onFocus={e => { e.currentTarget.style.borderBottomColor = 'rgba(0,191,255,0.5)'; }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#EDEFF3',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '17px',
              fontWeight: 500,
              padding: '4px 0',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '6px', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <X size={18} color="#8A8F98" />
          </button>
        </div>

        {/* ── Fields (non-scrolling) ── */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Status + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={localStatus}
                onChange={e => handleStatusChange(e.target.value as NodeStatus)}
                onFocus={handleFocus}
                onBlur={handleBlurReset}
                style={{ ...fieldInputStyle, cursor: 'pointer', appearance: 'none' }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={localPriority}
                onChange={e => handlePriorityChange(e.target.value as Priority | '')}
                onFocus={handleFocus}
                onBlur={handleBlurReset}
                style={{ ...fieldInputStyle, cursor: 'pointer', appearance: 'none' }}
              >
                <option value="">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Start Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date"
                value={localStartDate}
                onChange={e => setLocalStartDate(e.target.value)}
                onBlur={e => { handleDateTimeBlur(); handleBlurReset(e); }}
                onFocus={handleFocus}
                style={fieldInputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input
                type="time"
                value={localStartTime}
                onChange={e => setLocalStartTime(e.target.value)}
                onBlur={e => { handleDateTimeBlur(); handleBlurReset(e); }}
                onFocus={handleFocus}
                style={fieldInputStyle}
              />
            </div>
          </div>

          {/* End Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={localEndDate}
                onChange={e => setLocalEndDate(e.target.value)}
                onBlur={e => { handleDateTimeBlur(); handleBlurReset(e); }}
                onFocus={handleFocus}
                style={fieldInputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input
                type="time"
                value={localEndTime}
                onChange={e => setLocalEndTime(e.target.value)}
                onBlur={e => { handleDateTimeBlur(); handleBlurReset(e); }}
                onFocus={handleFocus}
                style={fieldInputStyle}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags</label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '6px 10px',
              minHeight: '38px',
            }}>
              {localTags.map(tag => (
                <span key={tag} style={{
                  background: 'rgba(0, 191, 255, 0.12)',
                  border: '1px solid rgba(0, 191, 255, 0.25)',
                  borderRadius: '20px',
                  color: '#00bfff',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00bfff', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                placeholder="+ add tag"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#7D828B',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '12px',
                  outline: 'none',
                  minWidth: '70px',
                  flex: 1,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Notes (scrollable section) ── */}
        <div style={{
          padding: '0 20px 14px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '14px',
        }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={localNotes}
            onChange={e => setLocalNotes(e.target.value)}
            onBlur={e => { handleNotesBlur(); handleBlurReset(e); }}
            onFocus={handleFocus}
            placeholder="Add a note..."
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              color: '#D5D8DE',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              padding: '10px 12px',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.6,
              overflowY: 'auto',
              minHeight: '80px',
              maxHeight: '140px',
            }}
          />
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => { onAddSubtask(node.id); onClose(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 191, 255, 0.08)',
              border: '1px solid rgba(0, 191, 255, 0.2)',
              borderRadius: '8px',
              color: '#00bfff',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 191, 255, 0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0, 191, 255, 0.08)')}
          >
            <Plus size={14} />
            Add Sub-task
          </button>

          <button
            onClick={() => {
              if (window.confirm('Delete this node and all its sub-tasks?')) {
                onDelete(node.id);
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(248, 81, 73, 0.08)',
              border: '1px solid rgba(248, 81, 73, 0.2)',
              borderRadius: '8px',
              color: '#f85149',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248, 81, 73, 0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248, 81, 73, 0.08)')}
          >
            <Trash2 size={14} />
            Delete Node
          </button>
        </div>
      </motion.div>
    </div>
  );
}
