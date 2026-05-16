import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import NodeTree from '../components/canvas/NodeTree';
import ProgressWidget from '../components/canvas/ProgressWidget';
import { useCanvasStore } from '../store/canvas.store';
import type { Node } from '../types/node.types';
import { flattenTree } from '../utils/tree';
import { useRecordRecent } from '../hooks/useRecordRecent';
import { useRecentsStore } from '../store/recents.store';
import { useUIStore } from '../store/ui.store';

export default function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const location = useLocation();
  const listNameFromState = (location.state as { listName?: string } | null)?.listName;
  const folderIdFromState = (location.state as { folderId?: string; folderName?: string } | null);
  const storedList = useRecentsStore((s) =>
    listId ? s.getEntry('list', listId) : undefined
  );
  const resolvedListName = listNameFromState ?? storedList?.name ?? 'Untitled List';

  const setActiveContext = useUIStore((s) => s.setActiveContext);
  useRecordRecent('list', listId, resolvedListName);

  useEffect(() => {
    if (listId) {
      setActiveContext({
        listId,
        listName: resolvedListName,
        folderId: folderIdFromState?.folderId,
        folderName: folderIdFromState?.folderName,
      });
    }
  }, [listId, resolvedListName, folderIdFromState, setActiveContext]);

  // Title editing state
  const [listTitle, setListTitle] = useState(resolvedListName);

  useEffect(() => {
    setListTitle(resolvedListName);
  }, [resolvedListName]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(listTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Canvas interaction state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDepth, setCurrentDepth] = useState(0);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [lastCreatedNodeId, setLastCreatedNodeId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Canvas panning state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Canvas store for selection
  const { selectedNodeId, selectNode } = useCanvasStore();

  // Computed stats
  const flatNodes = flattenTree(nodes);
  const doneCount = flatNodes.filter(n => n.status === 'DONE').length;
  const totalCount = flatNodes.length;

  // Title editing handlers
  function handleTitleDoubleClick() {
    setTempTitle(listTitle);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function handleTitleBlur() {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      setListTitle(tempTitle.trim());
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      titleInputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setTempTitle(listTitle);
      setIsEditingTitle(false);
    }
  }

  // Helper to add node to tree
  function addNodeToTree(tree: Node[], newNode: Node, parentId: string | null): Node[] {
    if (parentId === null) {
      return [...tree, newNode];
    }
    return tree.map(node => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode] };
      }
      return { ...node, children: addNodeToTree(node.children, newNode, parentId) };
    });
  }

  // Find parent node ID at given depth
  function findParentAtDepth(tree: Node[], targetDepth: number, currentDepth: number = 0): string | null {
    if (targetDepth === 0) return null;
    
    // Walk tree depth-first to find the last node at targetDepth - 1
    for (let i = tree.length - 1; i >= 0; i--) {
      const node = tree[i];
      if (currentDepth === targetDepth - 1) {
        return node.id;
      }
      if (node.children?.length > 0) {
        const found = findParentAtDepth(node.children, targetDepth, currentDepth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  // Compute position index
  function computePosition(tree: Node[], parentId: string | null): number {
    if (parentId === null) {
      return tree.length;
    }
    // Find parent and return its children count
    const findParent = (list: Node[]): Node | null => {
      for (const node of list) {
        if (node.id === parentId) return node;
        const found = findParent(node.children);
        if (found) return found;
      }
      return null;
    };
    const parent = findParent(tree);
    return parent ? parent.children.length : 0;
  }

  // Create new node
  function createNode(title: string) {
    const newNode: Node = {
      id: crypto.randomUUID(),
      title,
      status: 'TODO',
      priority: null,
      notes: null,
      startAt: null,
      endAt: null,
      reminderAt: null,
      canvasX: null,
      canvasY: null,
      position: computePosition(nodes, currentParentId),
      listId: 'local',
      parentId: currentParentId,
      children: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNodes(prev => addNodeToTree(prev, newNode, currentParentId));
    setLastCreatedNodeId(newNode.id);
    
    // For next node, if at depth > 0, parent becomes the node we just created
    if (currentDepth > 0) {
      setCurrentParentId(newNode.id);
    }
  }

  // Handle keyboard in textarea
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!currentInput.trim()) return;
      createNode(currentInput.trim());
      setCurrentInput('');
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Dedent
        if (currentDepth > 0) {
          const newDepth = currentDepth - 1;
          setCurrentDepth(newDepth);
          // Find new parent at newDepth - 1
          const newParent = findParentAtDepth(nodes, newDepth);
          setCurrentParentId(newParent);
        }
      } else {
        // Indent
        const newDepth = currentDepth + 1;
        setCurrentDepth(newDepth);
        // Parent is the last created node or find appropriate parent
        if (lastCreatedNodeId) {
          setCurrentParentId(lastCreatedNodeId);
        } else {
          const newParent = findParentAtDepth(nodes, newDepth);
          setCurrentParentId(newParent);
        }
      }
    }
    if (e.key === 'Escape') {
      setIsTyping(false);
      setCurrentInput('');
      setCurrentDepth(0);
      setCurrentParentId(null);
      setLastCreatedNodeId(null);
    }
    // Backspace at beginning of input = dedent (like Shift+Tab)
    if (e.key === 'Backspace') {
      const textarea = e.target as HTMLTextAreaElement;
      if (textarea.selectionStart === 0 && textarea.selectionEnd === 0 && currentDepth > 0) {
        e.preventDefault();
        const newDepth = currentDepth - 1;
        setCurrentDepth(newDepth);
        const newParent = findParentAtDepth(nodes, newDepth);
        setCurrentParentId(newParent);
      }
    }
  }

  // Toggle node status
  function toggleNodeStatus(id: string) {
    function updateNodeStatus(list: Node[]): Node[] {
      return list.map(node => {
        if (node.id === id) {
          const newStatus = node.status === 'DONE' ? 'TODO' : 'DONE';
          return { ...node, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return { ...node, children: updateNodeStatus(node.children) };
      });
    }
    setNodes(prev => updateNodeStatus(prev));
  }

  // Compute input position based on depth and node count
  function computeInputX(depth: number): number {
    return 60 + depth * 90;
  }

  function computeInputY(): number {
    const VERTICAL_GAP = 70;
    const startY = 28;
    return startY + flatNodes.length * VERTICAL_GAP;
  }

  // Handle canvas mouse down for panning
  function handleMouseDown(e: React.MouseEvent) {
    // Only left click and not on nodes/textarea
    if (e.button !== 0) return;
    
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    setIsDragging(true);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy,
    });
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDragging) return;
    
    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    
    // If mouse didn't move much, treat as a click to start typing
    if (dx < 5 && dy < 5 && !isTyping) {
      setIsTyping(true);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
    
    setIsDragging(false);
  }

  function handleMouseLeave() {
    setIsDragging(false);
  }

  return (
    <div style={{ background: '#1B1D21', height: '100vh', overflow: 'hidden' }}>
      <Topbar
        title={isEditingTitle ? '' : listTitle}
        onTitleDoubleClick={handleTitleDoubleClick}
        titleSlot={
          isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={tempTitle}
              onChange={e => setTempTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(0,191,255,0.5)',
                color: '#EDEFF3',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                textAlign: 'center',
                outline: 'none',
                width: '200px',
              }}
            />
          ) : null
        }
      />

      <SidePanel />

      {/* Canvas */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#1B1D21',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : isTyping ? 'text' : 'grab',
        }}
      >
        {/* Pannable content container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Empty state placeholder */}
          {nodes.length === 0 && !isTyping && (
            <p
              style={{
                position: 'absolute',
                top: '28px',
                left: '60px',
                color: '#7D828B',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '15px',
                fontWeight: 400,
                margin: 0,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              You can start typing here....
            </p>
          )}

        {/* Input textarea */}
        {isTyping && (
          <textarea
            ref={inputRef}
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (!currentInput.trim()) setIsTyping(false); }}
            spellCheck={false}
            style={{
              position: 'absolute',
              top: nodes.length === 0 ? 28 : computeInputY(),
              left: computeInputX(currentDepth),
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#EDEFF3',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              lineHeight: '24px',
              resize: 'none',
              caretColor: '#00bfff',
              width: '200px',
              minHeight: '24px',
              padding: 0,
              margin: 0,
              zIndex: 100,
            }}
            autoFocus
            rows={1}
          />
        )}

          {/* Node Tree */}
          {nodes.length > 0 && (
            <NodeTree
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onNodeCircleClick={toggleNodeStatus}
              onNodeTextClick={selectNode}
            />
          )}
        </div>{/* End pannable content */}
      </div>{/* End canvas */}

      {/* Floating Progress Widget */}
      <ProgressWidget total={totalCount} done={doneCount} />
    </div>
  );
}
