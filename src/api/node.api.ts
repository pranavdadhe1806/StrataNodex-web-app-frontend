import client from './client';
import type { Node, NodeStatus, Priority } from '../types/node.types';

export interface CreateNodeInput {
  title: string;
  listId: string;
  status?: NodeStatus;
  priority?: Priority;
  notes?: string;
  startAt?: string;
  endAt?: string;
  reminderAt?: string;
  canvasX?: number;
  canvasY?: number;
  position?: number;
  parentId?: string | null;
}

export interface CreateSubNodeInput {
  title: string;
  status?: NodeStatus;
  priority?: Priority;
  notes?: string;
  startAt?: string;
  endAt?: string;
  reminderAt?: string;
  canvasX?: number;
  canvasY?: number;
  position?: number;
}

export interface UpdateNodeInput {
  title?: string;
  status?: NodeStatus;
  priority?: Priority | null;
  notes?: string;
  startAt?: string | null;
  endAt?: string | null;
  reminderAt?: string | null;
  canvasX?: number;
  canvasY?: number;
  position?: number;
  parentId?: string | null;
  listId?: string;
}

export interface MoveNodeInput {
  parentId?: string | null;
  position?: number;
}

export const nodeApi = {
  getByList: (listId: string) =>
    client.get<Node[]>(`/lists/${listId}/nodes`).then(r => r.data),

  getOne: (id: string) =>
    client.get<Node>(`/nodes/${id}`).then(r => r.data),

  create: (listId: string, data: CreateNodeInput) =>
    client.post<Node>(`/lists/${listId}/nodes`, data).then(r => r.data),

  createChild: (parentId: string, data: CreateSubNodeInput) =>
    client.post<Node>(`/nodes/${parentId}/children`, data).then(r => r.data),

  update: (id: string, data: UpdateNodeInput) =>
    client.patch<Node>(`/nodes/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    client.delete(`/nodes/${id}`).then(r => r.data),

  move: (id: string, data: MoveNodeInput) =>
    client.patch<Node>(`/nodes/${id}/move`, data).then(r => r.data),

  attachTag: (nodeId: string, tagId: string) =>
    client.post(`/nodes/${nodeId}/tags/${tagId}`).then(r => r.data),

  detachTag: (nodeId: string, tagId: string) =>
    client.delete(`/nodes/${nodeId}/tags/${tagId}`).then(r => r.data),
};
