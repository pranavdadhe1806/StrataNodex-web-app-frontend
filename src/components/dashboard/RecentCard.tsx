import MacFolderIcon from '../ui/MacFolderIcon';
import ListMiniThumb from '../ui/ListMiniThumb';
import { useListPreview } from '../../hooks/useLists';

interface RecentCardProps {
  id: string;
  name: string;
  type: 'folder' | 'list';
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

function ListThumb({ id }: { id: string }) {
  const { data } = useListPreview(id);
  return (
    <ListMiniThumb
      nodeCount={data?._count?.nodes ?? 0}
      previewNodes={data?.nodes}
    />
  );
}

export default function RecentCard({ id, name, type, onClick, onContextMenu }: RecentCardProps) {
  const isFolder = type === 'folder';

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        minWidth: 0,
        padding: '10px 6px',
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
        <ListThumb id={id} />
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
