import { Pencil, Trash2 } from '../ui/icons';
import { FolderDuotone } from '../ui/icons';

interface FolderCardProps {
  name: string;
  listCount?: number;
  onClick: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export default function FolderCard({ name, listCount = 0, onClick, onRename, onDelete }: FolderCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--divider), inset 0 1px 0 var(--divider)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(36, 119, 198, 0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Action buttons */}
      {(onRename || onDelete) && (
        <div
          style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {onRename && (
            <button
              type="button"
              onClick={onRename}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}
            >
              <Pencil size={14} color="var(--text-muted)" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            >
              <Trash2 size={14} color="#f85149" />
            </button>
          )}
        </div>
      )}

      {/* Folder icon */}
      <div style={{ marginBottom: '12px' }}>
        <FolderDuotone size={32} weight="duotone" color="var(--accent)" />
      </div>

      {/* Name */}
      <div
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-main)',
          fontSize: '15px',
          fontWeight: 500,
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>

      {/* Subtext */}
      <div style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-main)', fontSize: '12px' }}>
        {listCount} {listCount === 1 ? 'list' : 'lists'}
      </div>
    </div>
  );
}
