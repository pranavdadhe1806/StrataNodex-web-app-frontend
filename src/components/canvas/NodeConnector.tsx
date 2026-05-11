interface NodeConnectorProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function NodeConnector({ fromX, fromY, toX, toY }: NodeConnectorProps) {
  // L-shaped path: down from parent, then right to child
  // Add 20px offset from parent's left edge for starting point
  const startX = fromX + 20;
  const startY = fromY;

  // Create SVG path: M startX startY V toY H toX
  const pathD = `M ${startX} ${startY} V ${toY} H ${toX}`;

  // Arrowhead at the end pointing right
  const arrowSize = 6;
  const arrowPath = `M ${toX} ${toY} L ${toX - arrowSize} ${toY - arrowSize / 2} L ${toX - arrowSize} ${toY + arrowSize / 2} Z`;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <filter id="connectorShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0, 0, 0, 0.6)" />
        </filter>
      </defs>
      {/* Main L-shaped line */}
      <path
        d={pathD}
        fill="none"
        stroke="#8B92A1"
        strokeWidth={1.5}
        filter="url(#connectorShadow)"
      />
      {/* Arrowhead */}
      <path
        d={arrowPath}
        fill="#8B92A1"
        stroke="none"
        filter="url(#connectorShadow)"
      />
    </svg>
  );
}
