import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Topbar from '../components/layout/Topbar';
import SidePanel from '../components/layout/SidePanel';
import NodeTree from '../components/canvas/NodeTree';
import NodeDetailPanel from '../components/canvas/NodeDetailPanel';
import ProgressWidget from '../components/canvas/ProgressWidget';
import { useCanvasStore } from '../store/canvas.store';
import type { Node } from '../types/node.types';
import { flattenTree, buildTree, findNode } from '../utils/tree';
import { useRecordRecent } from '../hooks/useRecordRecent';
import { useRecentsStore } from '../store/recents.store';
import { useUIStore } from '../store/ui.store';
import { useNodes, useCreateNode, useCreateSubNode, useUpdateNode, useDeleteNode } from '../hooks/useNodes';

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

  // ── Server state (for initial load + background sync) ─────────────────────
  const { data: rawNodes = [] } = useNodes(listId ?? null);
  const createNodeMutation = useCreateNode();
  const createSubNodeMutation = useCreateSubNode();
  const updateNodeMutation = useUpdateNode();
  const deleteNodeMutation = useDeleteNode();

  // ── Local optimistic node tree ────────────────────────────────────────────
  // Seeded from server on first load, then updated locally for zero lag
  const [nodes, setNodes] = useState<Node[]>([]);
  const serverSynced = useRef(false);
  // Maps temp UUIDs → Promise<realId> so sub-nodes await their parent's real ID
  const idPromises = useRef<Map<string, Promise<string>>>(new Map());

  useEffect(() => {
    // Only seed from server once (initial load). After that local state is source of truth.
    if (!serverSynced.current && rawNodes.length > 0) {
      setNodes(buildTree(rawNodes));
      serverSynced.current = true;
    }
    // If we navigate away and back (listId changes), re-sync
  }, [rawNodes]);

  // Also re-sync when listId changes (navigating between lists)
  const prevListId = useRef(listId);
  useEffect(() => {
    if (prevListId.current !== listId) {
      prevListId.current = listId;
      serverSynced.current = false;
      setNodes([]);
    }
  }, [listId]);

  // Title editing state
  const [listTitle, setListTitle] = useState(resolvedListName);
  useEffect(() => { setListTitle(resolvedListName); }, [resolvedListName]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(listTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Canvas interaction state
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
  // Ref for the pannable content div — used to detect background vs node-card clicks
  const pannableRef = useRef<HTMLDivElement>(null);
  const contentBoundsRef = useRef({ contentWidth: 800, contentHeight: 600 });

  // Canvas store for selection
  const { selectedNodeId } = useCanvasStore();

  // Popup state
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const detailNode = detailNodeId ? findNode(nodes, detailNodeId) : null;

  // Computed stats
  const flatNodes = flattenTree(nodes);
  const doneCount = flatNodes.filter(n => n.status === 'DONE').length;
  const totalCount = flatNodes.length;

  // Keep content bounds ref up-to-date (mirrors NodeTree layout constants)
  useEffect(() => {
    if (nodes.length === 0) {
      contentBoundsRef.current = { contentWidth: 800, contentHeight: 600 };
      return;
    }
    const NODE_CARD_WIDTH = 320;
    const PADDING = 40;
    const VERTICAL_GAP = 70;
    const NODE_HEIGHT = 40;
    let maxX = 60 + NODE_CARD_WIDTH;
    let currentY = 28;
    function walk(nodeList: Node[], depth: number) {
      for (const node of nodeList) {
        const x = 60 + depth * 90;
        if (x + NODE_CARD_WIDTH > maxX) maxX = x + NODE_CARD_WIDTH;
        currentY += VERTICAL_GAP;
        if (node.children?.length > 0) walk(node.children, depth + 1);
      }
    }
    walk(nodes, 0);
    contentBoundsRef.current = {
      contentWidth: maxX + PADDING,
      contentHeight: currentY + NODE_HEIGHT + PADDING,
    };
  }, [nodes]);

  // Clamp pan so viewport never strays beyond content boundaries
  const clampPan = useCallback((x: number, y: number): { x: number; y: number } => {
    const el = canvasRef.current;
    if (!el) return { x, y };
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const { contentWidth, contentHeight } = contentBoundsRef.current;
    const PAD = 40;
    return {
      x: Math.min(PAD, Math.max(contentWidth > vw ? -(contentWidth - vw + PAD) : 0, x)),
      y: Math.min(PAD, Math.max(contentHeight > vh ? -(contentHeight - vh + PAD) : 0, y)),
    };
  }, []);

  // Title editing handlers
  function handleTitleDoubleClick() {
    setTempTitle(listTitle);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function handleTitleBlur() {
    setIsEditingTitle(false);
    if (tempTitle.trim()) setListTitle(tempTitle.trim());
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') titleInputRef.current?.blur();
    if (e.key === 'Escape') {
      setTempTitle(listTitle);
      setIsEditingTitle(false);
    }
  }

  // ── Tree helpers (same as original) ──────────────────────────────────────
  function addNodeToTree(tree: Node[], newNode: Node, parentId: string | null): Node[] {
    if (parentId === null) return [...tree, newNode];
    return tree.map(node => {
      if (node.id === parentId) {
        return { ...node, children: [...(node.children ?? []), newNode] };
      }
      return { ...node, children: addNodeToTree(node.children ?? [], newNode, parentId) };
    });
  }

  function findParentAtDepth(tree: Node[], targetDepth: number, depth: number = 0): string | null {
    if (targetDepth === 0) return null;
    for (let i = tree.length - 1; i >= 0; i--) {
      const node = tree[i];
      if (depth === targetDepth - 1) return node.id;
      if (node.children?.length > 0) {
        const found = findParentAtDepth(node.children, targetDepth, depth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  function computePosition(tree: Node[], parentId: string | null): number {
    if (parentId === null) return tree.length;
    const findParent = (list: Node[]): Node | null => {
      for (const node of list) {
        if (node.id === parentId) return node;
        const found = findParent(node.children ?? []);
        if (found) return found;
      }
      return null;
    };
    const parent = findParent(tree);
    return parent ? (parent.children?.length ?? 0) : 0;
  }

  // Replace a temp ID with a real server ID throughout the tree
  function replaceTempId(tree: Node[], tempId: string, realId: string): Node[] {
    return tree.map(node => {
      const updatedChildren = replaceTempId(node.children ?? [], tempId, realId);
      if (node.id === tempId) return { ...node, id: realId, listId: listId!, children: updatedChildren };
      // Fix parentId references too
      if (node.parentId === tempId) return { ...node, parentId: realId, children: updatedChildren };
      return { ...node, children: updatedChildren };
    });
  }

  // ── Create node: optimistic + background save ─────────────────────────────
  const createNode = useCallback((title: string) => {
    if (!listId) return;

    const tempId = crypto.randomUUID();
    const position = computePosition(nodes, currentParentId);

    const newNode: Node = {
      id: tempId,
      title,
      status: 'TODO',
      priority: null,
      notes: null,
      startAt: null,
      endAt: null,
      reminderAt: null,
      canvasX: null,
      canvasY: null,
      position,
      listId,
      parentId: currentParentId,
      sourceNodeId: null,
      source: null,
      children: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Show instantly in local tree
    setNodes(prev => addNodeToTree(prev, newNode, currentParentId));
    setLastCreatedNodeId(tempId);

    // 2. Build a Promise<realId> for this node and store it
    //    Sub-nodes will await this promise so they always have the real parent ID
    let resolveRealId!: (id: string) => void;
    let rejectRealId!: (e: unknown) => void;
    const realIdPromise = new Promise<string>((res, rej) => {
      resolveRealId = res;
      rejectRealId = rej;
    });
    idPromises.current.set(tempId, realIdPromise);

    const onSaved = (savedId: string) => {
      resolveRealId(savedId);
      setNodes(prev => replaceTempId(prev, tempId, savedId));
      setLastCreatedNodeId(prev => prev === tempId ? savedId : prev);
      setCurrentParentId(prev => prev === tempId ? savedId : prev);
    };

    const rollback = (e: unknown) => {
      rejectRealId(e);
      idPromises.current.delete(tempId);
      setNodes(prev => {
        const remove = (tree: Node[]): Node[] =>
          tree.filter(n => n.id !== tempId).map(n => ({ ...n, children: remove(n.children ?? []) }));
        return remove(prev);
      });
    };

    // 3. Save to server — await parent's real ID if parent is a temp node
    const saveToServer = async () => {
      if (currentParentId === null) {
        const saved = await createNodeMutation.mutateAsync({
          listId,
          data: { title, listId, position },
        });
        onSaved(saved.id);
      } else {
        // Resolve the real parent ID — wait if parent save is still in flight
        const parentPromise = idPromises.current.get(currentParentId);
        const realParentId = parentPromise ? await parentPromise : currentParentId;
        const saved = await createSubNodeMutation.mutateAsync({
          parentId: realParentId,
          data: { title, position },
        });
        onSaved(saved.id);
      }
    };

    saveToServer().catch(rollback);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, nodes, currentParentId, currentDepth]);

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
        if (currentDepth > 0) {
          const newDepth = currentDepth - 1;
          setCurrentDepth(newDepth);
          setCurrentParentId(findParentAtDepth(nodes, newDepth));
        }
      } else {
        const newDepth = currentDepth + 1;
        setCurrentDepth(newDepth);
        setCurrentParentId(lastCreatedNodeId ?? findParentAtDepth(nodes, newDepth));
      }
    }
    if (e.key === 'Escape') {
      setIsTyping(false);
      setCurrentInput('');
      setCurrentDepth(0);
      setCurrentParentId(null);
      setLastCreatedNodeId(null);
    }
    if (e.key === 'Backspace') {
      const textarea = e.target as HTMLTextAreaElement;
      if (textarea.selectionStart === 0 && textarea.selectionEnd === 0 && currentDepth > 0) {
        e.preventDefault();
        const newDepth = currentDepth - 1;
        setCurrentDepth(newDepth);
        setCurrentParentId(findParentAtDepth(nodes, newDepth));
      }
    }
  }

  // ── Update node in local tree ─────────────────────────────────────────────
  function updateNodeInTree(updated: Node) {
    setNodes(prev => {
      function walk(list: Node[]): Node[] {
        return list.map(n => {
          if (n.id === updated.id) return { ...updated, children: n.children };
          return { ...n, children: walk(n.children ?? []) };
        });
      }
      return walk(prev);
    });
    // Sync to server in background — omit null fields (Zod rejects null for datetime/string)
    updateNodeMutation.mutate({ id: updated.id, data: {
      title: updated.title,
      status: updated.status,
      ...(updated.priority != null ? { priority: updated.priority } : {}),
      ...(updated.notes != null ? { notes: updated.notes } : {}),
      ...(updated.startAt != null ? { startAt: updated.startAt } : {}),
      ...(updated.endAt != null ? { endAt: updated.endAt } : {}),
    }});
  }

  // ── Delete node + all children from local tree ────────────────────────────
  function deleteNodeFromTree(id: string) {
    setNodes(prev => {
      function walk(list: Node[]): Node[] {
        return list.filter(n => n.id !== id).map(n => ({ ...n, children: walk(n.children ?? []) }));
      }
      return walk(prev);
    });
    setDetailNodeId(null);
    deleteNodeMutation.mutate(id);
  }

  // ── Add subtask from popup ─────────────────────────────────────────────────
  function addSubtaskFromPopup(parentId: string) {
    // Set up input state to type a child of the clicked node
    setCurrentParentId(parentId);
    setCurrentDepth(1);
    setIsTyping(true);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }

  // ── Toggle status: optimistic + background save ───────────────────────────
  function toggleNodeStatus(id: string) {
    // Optimistic update immediately
    setNodes(prev => {
      function updateStatus(list: Node[]): Node[] {
        return list.map(node => {
          if (node.id === id) {
            const newStatus = node.status === 'DONE' ? 'TODO' : 'DONE';
            return { ...node, status: newStatus };
          }
          return { ...node, children: updateStatus(node.children ?? []) };
        });
      }
      return updateStatus(prev);
    });
    // Save to server in background
    const flat = flattenTree(nodes);
    const node = flat.find(n => n.id === id);
    if (node) {
      const newStatus = node.status === 'DONE' ? 'TODO' : 'DONE';
      updateNodeMutation.mutate({ id, data: { status: newStatus } });
    }
  }

  // Compute input position
  function computeInputX(depth: number): number { return 60 + depth * 90; }
  function computeInputY(): number { return 28 + flatNodes.length * 70; }

  // Canvas pan handlers
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    setIsDragging(true);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setPan(clampPan(
      panStart.current.x + (e.clientX - dragStart.current.x),
      panStart.current.y + (e.clientY - dragStart.current.y),
    ));
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDragging) return;
    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    // Only open the typing input when the click lands directly on the canvas background
    // or the pannable content div — NOT on a node card or any of its children.
    // Without this check every node-card click triggers setIsTyping(true) and jumps
    // the textarea focus to the very bottom of the canvas (28 + N*70 px).
    const isBackgroundClick =
      e.target === canvasRef.current || e.target === pannableRef.current;
    if (dx < 5 && dy < 5 && !isTyping && isBackgroundClick) {
      setIsTyping(true);
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    }
    setIsDragging(false);
  }

  function handleMouseLeave() { setIsDragging(false); }

  // Wheel-to-pan: listen on window so it works even when a fixed overlay (NodeDetailPanel)
  // sits above the canvas and intercepts events on canvasRef.
  // We skip panning when the scroll originates inside the detail panel's own scrollable body
  // (marked with data-scroll-container) so that panel still scrolls normally.
  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element;
      if (target.closest('[data-scroll-container]')) return; // let panel body scroll
      e.preventDefault();
      setPan(prev => clampPan(prev.x - e.deltaX, prev.y - e.deltaY));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [clampPan]);

  // CRITICAL: Chrome sets scrollTop on overflow:hidden ancestors when focus() is called on a
  // deeply-positioned element (e.g. the textarea at top: 13,000+px inside the pannable div).
  // This causes the visual canvas content to jump even though pan.y hasn’t changed.
  // We reset scrollTop to 0 after every render to guarantee it stays at 0.
  // preventScroll:true on focus() calls prevents the initial scroll, but this is a safety net.
  useLayoutEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.scrollTop = 0;
      canvasRef.current.scrollLeft = 0;
    }
  });

  return (
    <div style={{ background: '#1B1D21', height: '100vh', overflow: 'hidden' }}>
      <AnimatePresence>
        {detailNode && (
          <NodeDetailPanel
            node={detailNode}
            onClose={() => setDetailNodeId(null)}
            onUpdate={updateNodeInTree}
            onDelete={deleteNodeFromTree}
            onAddSubtask={addSubtaskFromPopup}
          />
        )}
      </AnimatePresence>
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
        ref={canvasRef}
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
          ref={pannableRef}
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
              fontSize: '20px',
              lineHeight: '30px',
              resize: 'none',
              caretColor: '#00bfff',
              width: '200px',
              minHeight: '24px',
              padding: 0,
              margin: 0,
              zIndex: 100,
            }}
            rows={1}
          />
        )}

          {/* Node Tree */}
          {nodes.length > 0 && (
            <NodeTree
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onNodeCircleClick={toggleNodeStatus}
              onNodeTextClick={(id) => {
                // Close typing mode before opening the detail panel.
                // If the textarea was active, its blur fires setIsTyping(false) anyway,
                // but doing it explicitly here prevents any intermediate render with isTyping=true
                // that could trigger a Chrome scroll to the textarea position.
                setIsTyping(false);
                setDetailNodeId(id);
              }}
            />
          )}
        </div>{/* End pannable content */}
      </div>{/* End canvas */}

      {/* Floating Progress Widget */}
      <ProgressWidget total={totalCount} done={doneCount} />
    </div>
  );
}
