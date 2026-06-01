import { useRef, useCallback } from 'react';
import type { Node } from '../types/node.types';

const MAX_HISTORY = 50;

export function useUndoRedo() {
  const past = useRef<Node[][]>([]);
  const future = useRef<Node[][]>([]);

  const push = useCallback((snapshot: Node[]) => {
    past.current.push(JSON.parse(JSON.stringify(snapshot)));
    if (past.current.length > MAX_HISTORY) past.current.shift();
    future.current = [];
  }, []);

  const undo = useCallback((current: Node[]): Node[] | null => {
    if (past.current.length === 0) return null;
    future.current.push(JSON.parse(JSON.stringify(current)));
    return past.current.pop()!;
  }, []);

  const redo = useCallback((current: Node[]): Node[] | null => {
    if (future.current.length === 0) return null;
    past.current.push(JSON.parse(JSON.stringify(current)));
    return future.current.pop()!;
  }, []);

  const canUndo = () => past.current.length > 0;
  const canRedo = () => future.current.length > 0;

  return { push, undo, redo, canUndo, canRedo };
}
