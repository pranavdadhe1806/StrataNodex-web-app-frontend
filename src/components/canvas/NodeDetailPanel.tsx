import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Calendar, Clock, Tag as TagIcon, FileText, Flag, CircleDot, CalendarDays } from 'lucide-react';
import type { Node, NodeStatus, Priority } from '../../types/node.types';
import RichTextEditor from '../ui/RichTextEditor';
import CustomSelect from '../ui/CustomSelect';
import CustomDatePicker from '../ui/CustomDatePicker';
import CustomTimePicker from '../ui/CustomTimePicker';
import { useAddToDaily, useRemoveFromDaily, useDailyList } from '../../hooks/useDaily';

interface NodeDetailPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (updated: Node) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-main)',
  fontSize: '11px',
  color: 'var(--text-placeholder)',
  fontWeight: 500,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'block',
};

function PropertyRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)' }}>
        {icon}
        <span style={{ ...labelStyle, marginBottom: 0 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function NodeDetailPanel({ node, onClose, onUpdate, onDelete, onAddSubtask }: NodeDetailPanelProps) {
  const { data: dailyData } = useDailyList();
  const addToDaily = useAddToDaily();
  const removeFromDaily = useRemoveFromDaily();

  const isInDaily = dailyData?.nodes.some(
    n => n.id === node.id || n.sourceNodeId === node.id
  ) ?? false;
  // Helper: convert a stored UTC ISO string to local date "YYYY-MM-DD" and time "HH:MM"
  function isoToLocalParts(iso: string | null | undefined): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { date, time };
  }

  const [localTitle, setLocalTitle] = useState(node.title);
  const [localStatus, setLocalStatus] = useState<NodeStatus>(node.status);
  const [localPriority, setLocalPriority] = useState<Priority | ''>(node.priority ?? '');
  const [localStartDate, setLocalStartDate] = useState(isoToLocalParts(node.startAt).date);
  const [localStartTime, setLocalStartTime] = useState(isoToLocalParts(node.startAt).time);
  const [localEndDate, setLocalEndDate] = useState(isoToLocalParts(node.endAt).date);
  const [localEndTime, setLocalEndTime] = useState(isoToLocalParts(node.endAt).time);
  const [localNotes, setLocalNotes] = useState(node.notes ?? '');
  const [localTags, setLocalTags] = useState<string[]>(node.tags?.map(t => t.name) ?? []);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setLocalTitle(node.title);
    setLocalStatus(node.status);
    setLocalPriority(node.priority ?? '');
    setLocalNotes(node.notes ?? '');
    setLocalTags(node.tags?.map(t => t.name) ?? []);
    setLocalStartDate(isoToLocalParts(node.startAt).date);
    setLocalStartTime(isoToLocalParts(node.startAt).time);
    setLocalEndDate(isoToLocalParts(node.endAt).date);
    setLocalEndTime(isoToLocalParts(node.endAt).time);
  }, [node.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Helper: convert local date string "YYYY-MM-DD" + time "HH:MM" to a UTC ISO string
  function buildDateTimeString(date: string, time: string): string | null {
    if (!date) return null;
    const localIso = time ? `${date}T${time}:00` : `${date}T00:00:00`;
    return new Date(localIso).toISOString();
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
        background: 'var(--overlay)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 'min(760px, 92vw)',
          maxHeight: '88vh',
          borderRadius: '18px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-elevated)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '24px 28px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          borderBottom: '1px solid var(--divider)',
        }}>
          <input
            value={localTitle}
            onChange={e => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Untitled task"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-main)',
              fontSize: '24px',
              fontWeight: 600,
              padding: '2px 0',
              outline: 'none',
              letterSpacing: '-0.01em',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', flexShrink: 0, marginTop: '2px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--divider)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div data-scroll-container="true" style={{ overflowY: 'auto', flex: 1, padding: '20px 28px 8px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Properties grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
            <PropertyRow icon={<CircleDot size={14} />} label="Status">
              <CustomSelect
                value={localStatus}
                onChange={v => handleStatusChange(v as NodeStatus)}
                options={[
                  { value: 'TODO', label: 'To Do', color: 'var(--text-muted)' },
                  { value: 'IN_PROGRESS', label: 'In Progress', color: 'var(--accent)' },
                  { value: 'DONE', label: 'Done', color: 'var(--accent-teal)' },
                ]}
              />
            </PropertyRow>

            <PropertyRow icon={<Flag size={14} />} label="Priority">
              <CustomSelect
                value={localPriority}
                onChange={v => handlePriorityChange(v as Priority | '')}
                options={[
                  { value: '', label: 'None', color: 'var(--text-placeholder)' },
                  { value: 'LOW', label: 'Low', color: 'var(--accent-teal)' },
                  { value: 'MEDIUM', label: 'Medium', color: '#f7b955' },
                  { value: 'HIGH', label: 'High', color: '#f85149' },
                ]}
              />
            </PropertyRow>

            <PropertyRow icon={<Calendar size={14} />} label="Start Date">
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '8px' }}>
                <CustomDatePicker value={localStartDate} onChange={v => { setLocalStartDate(v); setTimeout(handleDateTimeBlur, 0); }} />
                <CustomTimePicker value={localStartTime} onChange={v => { setLocalStartTime(v); setTimeout(handleDateTimeBlur, 0); }} />
              </div>
            </PropertyRow>

            <PropertyRow icon={<Clock size={14} />} label="End Date">
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '8px' }}>
                <CustomDatePicker value={localEndDate} onChange={v => { setLocalEndDate(v); setTimeout(handleDateTimeBlur, 0); }} />
                <CustomTimePicker value={localEndTime} onChange={v => { setLocalEndTime(v); setTimeout(handleDateTimeBlur, 0); }} />
              </div>
            </PropertyRow>
          </div>

          {/* Tags */}
          <PropertyRow icon={<TagIcon size={14} />} label="Tags">
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignItems: 'center',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '7px 10px',
              minHeight: '40px',
            }}>
              {localTags.map(tag => (
                <span key={tag} style={{
                  background: 'rgba(36,119,198,0.12)',
                  border: '1px solid rgba(36,119,198,0.25)',
                  borderRadius: '20px',
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-main)',
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                placeholder={localTags.length === 0 ? '+ add tag (press Enter)' : '+'}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-main)',
                  fontSize: '12.5px',
                  outline: 'none',
                  minWidth: '90px',
                  flex: 1,
                }}
              />
            </div>
          </PropertyRow>

          {/* Notes — rich text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-muted)' }}>
              <FileText size={14} />
              <span style={{ fontFamily: 'var(--font-main)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>Notes</span>
            </div>
            <RichTextEditor
              value={localNotes}
              onChange={setLocalNotes}
              onBlur={handleNotesBlur}
              placeholder="Write notes, ideas, or anything important…"
              minHeight={180}
              maxHeight={340}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          borderTop: '1px solid var(--divider)',
          background: 'var(--bg-input)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => { onAddSubtask(node.id); onClose(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(36,119,198,0.08)',
              border: '1px solid rgba(36,119,198,0.2)',
              borderRadius: '8px',
              color: 'var(--accent)',
              fontFamily: 'var(--font-main)',
              fontSize: '13px',
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(36,119,198,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(36,119,198,0.08)')}
          >
            <Plus size={14} />
            Add Sub-task
          </button>

          <button
            onClick={() => isInDaily ? removeFromDaily.mutate(node.id) : addToDaily.mutate(node.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isInDaily ? 'rgba(48,209,88,0.08)' : 'rgba(36,119,198,0.08)',
              border: isInDaily ? '1px solid rgba(48,209,88,0.25)' : '1px solid rgba(36,119,198,0.2)',
              borderRadius: '8px',
              color: isInDaily ? 'var(--accent-teal)' : 'var(--accent)',
              fontFamily: 'var(--font-main)', fontSize: '13px',
              padding: '8px 14px', cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = isInDaily ? 'rgba(48,209,88,0.14)' : 'rgba(36,119,198,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = isInDaily ? 'rgba(48,209,88,0.08)' : 'rgba(36,119,198,0.08)')}
          >
            <CalendarDays size={14} />
            {isInDaily ? 'Remove from Daily' : 'Add to Daily'}
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
              fontFamily: 'var(--font-main)',
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
