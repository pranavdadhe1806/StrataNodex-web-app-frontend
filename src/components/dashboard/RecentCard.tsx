import { Folder, List } from 'lucide-react';

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
        justifyContent: 'center',
        width: '100%',
        minWidth: 0,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: '100%',
          maxWidth: '96px',
          aspectRatio: '5 / 6',
          margin: '0 auto',
          background: '#32363C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          boxShadow:
            '0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px',
          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {isFolder ? (
          <Folder size={28} style={{ color: '#00bfff', flexShrink: 0 }} />
        ) : (
          <List size={28} style={{ color: '#00c896', flexShrink: 0 }} />
        )}
        <span
          style={{
            color: '#D5D8DE',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            textAlign: 'center',
            marginTop: '8px',
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
      </span>
    </button>
  );
}
