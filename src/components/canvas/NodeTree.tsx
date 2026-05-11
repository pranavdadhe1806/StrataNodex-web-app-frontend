import { useMemo } from 'react';
import type { Node } from '../../types/node.types';
import NodeCard from './NodeCard';
import { computeNumbering } from '../../utils/numbering';

interface NodeTreeProps {
  nodes: Node[];
  selectedNodeId: string | null;
  onNodeCircleClick: (id: string) => void;
  onNodeTextClick: (id: string) => void;
}

interface PositionedNode extends Node {
  x: number;
  y: number;
}

interface ConnectorInfo {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  key: string;
}

export default function NodeTree({
  nodes,
  selectedNodeId,
  onNodeCircleClick,
  onNodeTextClick,
}: NodeTreeProps) {
  // Compute numbering
  const numbering = useMemo(() => computeNumbering(nodes), [nodes]);

  // Calculate positions and collect connectors
  const { positionedNodes, connectors } = useMemo(() => {
    const posNodes: PositionedNode[] = [];
    const conns: ConnectorInfo[] = [];
    let currentY = 28; // Start 28px from top

    // Card height for position calculations (including gap)
    const NODE_HEIGHT = 40; // Approximate card height
    const VERTICAL_GAP = 70;

    function walk(nodeList: Node[], depth: number, parent: PositionedNode | null) {
      for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList[i];
        const x = 60 + depth * 90; // 60px base + 90px per depth
        const y = currentY;

        const posNode: PositionedNode = { ...node, x, y };
        posNodes.push(posNode);

        // Create connector if has parent
        if (parent) {
          const parentBottomY = parent.y + NODE_HEIGHT; // Bottom of parent card
          const childMiddleY = y + NODE_HEIGHT / 2; // Middle of child card (for arrow target)
          conns.push({
            fromX: parent.x + 20, // Offset from parent left
            fromY: parentBottomY,
            toX: x, // Left edge of child
            toY: childMiddleY, // Middle of child card (arrow points here)
            key: `${parent.id}-${node.id}`,
          });
        }

        currentY += VERTICAL_GAP;

        // Process children recursively
        if (node.children?.length > 0) {
          walk(node.children, depth + 1, posNode);
        }
      }
    }

    walk(nodes, 0, null);
    return { positionedNodes: posNodes, connectors: conns };
  }, [nodes]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* SVG Connectors Layer */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <defs>
          <filter id="connectorShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0, 0, 0, 0.6)" />
          </filter>
        </defs>
        {connectors.map((conn) => {
          // L-shaped path: down from parent bottom, then right to child middle
          const startX = conn.fromX;
          const startY = conn.fromY;
          const endX = conn.toX;
          const endY = conn.toY;
          // Path: go down to child's Y level, then right to child
          const pathD = `M ${startX} ${startY} V ${endY} H ${endX}`;
          const arrowSize = 6;
          // Arrow triangle pointing right at the end
          const arrowPath = `M ${endX} ${endY} L ${endX - arrowSize} ${endY - arrowSize / 2} L ${endX - arrowSize} ${endY + arrowSize / 2} Z`;

          return (
            <g key={conn.key}>
              <path
                d={pathD}
                fill="none"
                stroke="#8B92A1"
                strokeWidth={1.5}
                filter="url(#connectorShadow)"
              />
              <path d={arrowPath} fill="#8B92A1" stroke="none" filter="url(#connectorShadow)" />
            </g>
          );
        })}
      </svg>

      {/* Node Cards Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        {positionedNodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            isFocused={selectedNodeId === node.id}
            numbering={numbering.get(node.id) || ''}
            onCircleClick={() => onNodeCircleClick(node.id)}
            onTextClick={() => onNodeTextClick(node.id)}
            style={{
              left: node.x,
              top: node.y,
            }}
          />
        ))}
      </div>
    </div>
  );
}
