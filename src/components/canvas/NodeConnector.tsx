interface NodeConnectorProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function NodeConnector({ fromX, fromY, toX, toY }: NodeConnectorProps) {
  const startX = fromX + 20;
  const startY = fromY;

  const pathD = `M ${startX} ${startY} V ${toY} H ${toX}`;

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
      <path
        d={pathD}
        fill="none"
        stroke="var(--connector-color)"
        strokeWidth={1.5}
      />
      <path
        d={arrowPath}
        fill="var(--connector-color)"
        stroke="none"
      />
    </svg>
  );
}
