interface ListMiniThumbProps {
  nodeCount: number;
  previewNodes?: { id: string; title: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' }[];
}

export default function ListMiniThumb({ nodeCount, previewNodes = [] }: ListMiniThumbProps) {
  return (
    <div style={{
      width: '72px',
      height: '72px',
      borderRadius: '14px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      padding: '8px 7px 6px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* 5 rows */}
      {Array.from({ length: 5 }).map((_, i) => {
        const node = previewNodes[i];
        const isDone = node?.status === 'DONE';
        const hasTasks = i < nodeCount;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minHeight: 0 }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              flexShrink: 0,
              border: `1.5px solid ${hasTasks ? (isDone ? 'var(--accent-teal)' : 'rgba(36, 119, 198, 0.75)') : 'var(--border)'}`,
              background: isDone ? 'var(--accent-teal)' : 'transparent',
            }} />
            <div style={{
              height: '4px',
              borderRadius: '2px',
              background: hasTasks ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
              flex: 1,
            }} />
          </div>
        );
      })}

      {/* task count */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '2px',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-main)',
          fontSize: '7px',
          color: nodeCount > 0 ? 'var(--text-muted)' : 'rgba(255,255,255,0.1)',
          fontWeight: 500,
        }}>
          {nodeCount > 0 ? `${nodeCount} task${nodeCount !== 1 ? 's' : ''}` : 'empty'}
        </span>
      </div>
    </div>
  );
}
