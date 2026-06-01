import { useMemo, useState } from 'react';
import type { Node } from '../../types/node.types';
import NodeCard from './NodeCard';
import { computeNumbering } from '../../utils/numbering';

interface NodeTreeProps {
  nodes: Node[];
  selectedNodeId: string | null;
  onNodeCircleClick: (id: string) => void;
  onNodeTextClick: (id: string) => void;
  onMoveNode?: (nodeId: string, targetParentId: string | null, insertBeforeNodeId: string | null) => void;
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
  onMoveNode,
}: NodeTreeProps) {
  // Drag state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ y: number; x: number; targetParentId: string | null; insertBeforeNodeId: string | null } | null>(null);

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

  // Size the SVG to fit all node content so connectors never clip
  const NODE_CARD_WIDTH = 320; // matches NodeCard maxWidth
  const VERTICAL_GAP = 70;
  const PADDING = 40;
  const contentWidth = positionedNodes.length === 0 ? 800
    : Math.max(...positionedNodes.map(n => n.x + NODE_CARD_WIDTH)) + PADDING;
  const contentHeight = positionedNodes.length === 0 ? 600
    : Math.max(...positionedNodes.map(n => n.y + 40)) + PADDING;

  // Drag Handlers
  const handleDragStart = (id: string) => {
    setDraggingNodeId(id);
  };

  const handleDrag = (_id: string, y: number, _x: number) => {
    // Determine target index in flattened list based on Y
    const targetFlatIndex = Math.max(0, Math.min(positionedNodes.length, Math.round((y - 28) / VERTICAL_GAP)));
    
    let targetParentId: string | null = null;
    let insertBeforeNodeId: string | null = null;
    let dropY = 28 + targetFlatIndex * VERTICAL_GAP;
    let dropX = 60;

    if (targetFlatIndex === 0) {
      targetParentId = null;
      insertBeforeNodeId = positionedNodes.length > 0 ? positionedNodes[0].id : null;
      dropX = 60;
    } else if (targetFlatIndex < positionedNodes.length) {
      const nextNode = positionedNodes[targetFlatIndex];
      targetParentId = nextNode.parentId;
      insertBeforeNodeId = nextNode.id;
      dropX = nextNode.x;
    } else {
      const prevNode = positionedNodes[positionedNodes.length - 1];
      targetParentId = prevNode.parentId;
      insertBeforeNodeId = null;
      dropX = prevNode.x;
    }

    setDropTarget({
      y: dropY - 15, // Midpoint between nodes
      x: dropX,
      targetParentId,
      insertBeforeNodeId,
    });
  };

  const handleDragEnd = (id: string) => {
    if (dropTarget && onMoveNode) {
      // Don't move if we drop it on itself or right after itself (no-op)
      if (dropTarget.insertBeforeNodeId !== id) {
        onMoveNode(id, dropTarget.targetParentId, dropTarget.insertBeforeNodeId);
      }
    }
    setDraggingNodeId(null);
    setDropTarget(null);
  };

  return (
    <div style={{ position: 'relative', width: contentWidth, height: contentHeight }}>
      {/* SVG Connectors Layer */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'visible',
        }}
        width={contentWidth}
        height={contentHeight}
      >

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
                stroke="var(--connector-color)"
                strokeWidth={1.5}
              />
              <path d={arrowPath} fill="var(--connector-color)" stroke="none" />
            </g>
          );
        })}
      </svg>

      {/* Node Cards Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: contentWidth, height: contentHeight, zIndex: 1 }}>
        {positionedNodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            isFocused={selectedNodeId === node.id}
            numbering={numbering.get(node.id) || ''}
            onCircleClick={() => onNodeCircleClick(node.id)}
            onTextClick={() => onNodeTextClick(node.id)}
            onDragStart={() => handleDragStart(node.id)}
            onDrag={(y, x) => handleDrag(node.id, y, x)}
            onDragEnd={() => handleDragEnd(node.id)}
            style={{
              left: node.x,
              top: node.y,
              opacity: draggingNodeId === node.id ? 0.5 : 1, // Dim the original while dragging
            }}
          />
        ))}
      </div>

      {/* Drop Indicator */}
      {dropTarget && draggingNodeId && (
        <div
          style={{
            position: 'absolute',
            left: dropTarget.x,
            top: dropTarget.y,
            width: NODE_CARD_WIDTH,
            height: '4px',
            background: 'var(--accent)',
            borderRadius: '2px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* A small dot on the left of the line */}
          <div style={{
            position: 'absolute',
            left: '-6px',
            top: '-3px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--bg-base)'
          }} />
        </div>
      )}
    </div>
  );
}
