interface ListPreviewCardProps {
  name: string;
  nodeCount: number;
  isSelected?: boolean;
  isEditing?: boolean;
  editNameValue?: string;
  onEditChange?: (v: string) => void;
  onEditKeyDown?: (e: React.KeyboardEvent) => void;
  onEditBlur?: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
}

export default function ListPreviewCard({
  name,
  nodeCount,
  isSelected = false,
  isEditing = false,
  editNameValue = '',
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  onEditClick,
}: ListPreviewCardProps) {
  const previewRows = Math.min(nodeCount, 5);
  const emptyRows = Math.max(0, 4 - previewRows);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: '0',
      }}
    >
      {/* Square preview area */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '16px',
          background: isSelected ? '#2A3040' : '#252830',
          border: isSelected
            ? '1.5px solid rgba(0, 191, 255, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          padding: '14px 14px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Filled rows (represent real tasks) */}
        {Array.from({ length: previewRows }).map((_, i) => (
          <div
            key={`filled-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '1.5px solid rgba(0, 191, 255, 0.5)',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.12)',
                width: `${55 + ((i * 37) % 35)}%`,
              }}
            />
          </div>
        ))}

        {/* Empty placeholder rows */}
        {Array.from({ length: emptyRows }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                width: `${40 + ((i * 23) % 30)}%`,
              }}
            />
          </div>
        ))}

        {/* Task count badge */}
        {nodeCount > 0 && (
          <div
            style={{
              marginTop: 'auto',
              alignSelf: 'flex-end',
              fontSize: '10px',
              color: '#8A8F98',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
            }}
          >
            {nodeCount} task{nodeCount !== 1 ? 's' : ''}
          </div>
        )}

        {nodeCount === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.08)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '11px',
              }}
            >
              empty
            </span>
          </div>
        )}
      </div>

      {/* Name below */}
      <div style={{ padding: '8px 4px 0' }}>
        {isEditing ? (
          <input
            type="text"
            value={editNameValue}
            onChange={(e) => onEditChange?.(e.target.value)}
            onKeyDown={onEditKeyDown}
            onBlur={onEditBlur}
            autoFocus
            onClick={onEditClick}
            style={{
              width: '100%',
              padding: '4px 8px',
              background: '#1B1D21',
              border: '1px solid rgba(0, 191, 255, 0.5)',
              borderRadius: '6px',
              color: '#EDEFF3',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <p
            style={{
              color: '#D5D8DE',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              margin: 0,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </p>
        )}
      </div>
    </div>
  );
}
