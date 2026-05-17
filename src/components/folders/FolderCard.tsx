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
        background: '#32363C',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 191, 255, 0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#8A8F98' }}
            >
              <Pencil size={14} color="#8A8F98" />
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
        <FolderDuotone size={32} weight="duotone" color="#00bfff" />
      </div>

      {/* Name */}
      <div
        style={{
          color: '#EDEFF3',
          fontFamily: 'Poppins, sans-serif',
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
      <div style={{ color: '#7D828B', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
        {listCount} {listCount === 1 ? 'list' : 'lists'}
      </div>
    </div>
  );
}
