export type NodeStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Node {
  id: string;
  title: string;
  status: NodeStatus;
  priority: Priority | null;
  notes: string | null;
  startAt: string | null;
  endAt: string | null;
  reminderAt: string | null;
  canvasX: number | null;
  canvasY: number | null;
  position: number;
  listId: string;
  parentId: string | null;
  sourceNodeId: string | null;
  source: { id: string; title: string; listId: string; list: { id: string; name: string } } | null;
  tags: import('./tag.types').Tag[];
  children: Node[];
  createdAt: string;
  updatedAt: string;
}
