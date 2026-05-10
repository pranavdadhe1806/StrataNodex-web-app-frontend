import type { Node } from '../types/node.types';

export function computeNumbering(nodes: Node[]): Map<string, string> {
  const map = new Map<string, string>();

  function walk(list: Node[], prefix: string) {
    list.forEach((node, i) => {
      const num = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      map.set(node.id, num);
      if (node.children?.length) {
        walk(node.children, num);
      }
    });
  }

  walk(nodes, '');
  return map;
}
