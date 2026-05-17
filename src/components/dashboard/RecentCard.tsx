import { ListDuotone } from '../ui/icons';
import MacFolderIcon from '../ui/MacFolderIcon';

interface RecentCardProps {
  name: string;
  type: 'folder' | 'list';
  onClick: () => void;
}

export default function RecentCard({ name, type, onClick }: RecentCardProps) {
  const isFolder = type === 'folder';

  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        minWidth: 0,
        padding: '12px 6px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        borderRadius: '10px',
        transition: 'background 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {isFolder ? (
        <MacFolderIcon size={64} />
      ) : (
        <ListDuotone size={56} weight="duotone" color="#00c896" />
      )}
      <span
        style={{
          color: '#D5D8DE',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.3',
        }}
      >
        {name}
      </span>
    </button>
  );
}
