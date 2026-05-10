import type { Node } from '../types/node.types';

export function flattenTree(nodes: Node[]): Node[] {
  const result: Node[] = [];
  function walk(list: Node[]) {
    for (const node of list) {
      result.push(node);
      if (node.children?.length) walk(node.children);
    }
  }
  walk(nodes);
  return result;
}

export function findNode(nodes: Node[], id: string): Node | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function buildTree(flat: Node[]): Node[] {
  const map = new Map<string, Node>();
  const roots: Node[] = [];
  for (const node of flat) {
    map.set(node.id, { ...node, children: [] });
  }
  for (const node of flat) {
    const mapped = map.get(node.id)!;
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children!.push(mapped);
    } else {
      roots.push(mapped);
    }
  }
  return roots;
}
