interface PreviewNode {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

interface ListPreviewCardProps {
  name: string;
  nodeCount: number;
  previewNodes?: PreviewNode[];
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
  previewNodes = [],
  isSelected = false,
  isEditing = false,
  editNameValue = '',
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  onEditClick,
}: ListPreviewCardProps) {
  const rows = 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Square preview card */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '20px',
          background: isSelected ? '#2A3040' : '#22252A',
          border: isSelected
            ? '1.5px solid rgba(0, 191, 255, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '14px 12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
        }}
      >
        {/* Rows — real titles or empty placeholders */}
        {Array.from({ length: rows }).map((_, i) => {
          const node = previewNodes[i];
          const isDone = node?.status === 'DONE';
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Circle */}
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: `2px solid ${node ? (isDone ? '#00c896' : 'rgba(0, 191, 255, 0.75)') : 'rgba(255,255,255,0.08)'}`,
                background: isDone ? '#00c896' : 'transparent',
                flexShrink: 0,
              }} />
              {/* Title or placeholder bar */}
              {node ? (
                <span style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: isDone ? '#8A8F98' : '#D5D8DE',
                  textDecoration: isDone ? 'line-through' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  minWidth: 0,
                }}>
                  {node.title}
                </span>
              ) : (
                <div style={{
                  height: '7px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.04)',
                  flex: 1,
                }} />
              )}
            </div>
          );
        })}

        {/* Task count badge — bottom right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px', flexShrink: 0 }}>
          <span style={{
            fontSize: '10px',
            color: nodeCount > 0 ? '#8A8F98' : 'rgba(255,255,255,0.1)',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
          }}>
            {nodeCount > 0 ? `${nodeCount} task${nodeCount !== 1 ? 's' : ''}` : 'empty'}
          </span>
        </div>
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
              fontSize: '13px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <p style={{
            color: '#D5D8DE',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            margin: 0,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {name}
          </p>
        )}
      </div>
    </div>
  );
}
