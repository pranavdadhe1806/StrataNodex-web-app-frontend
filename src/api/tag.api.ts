import client from './client';
import type { Tag } from '../types/tag.types';

export interface CreateTagInput {
  name: string;
  color?: string;
  listId?: string | null;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

export const tagApi = {
  getAll: (listId?: string) =>
    client.get<Tag[]>('/tags', { params: listId ? { listId } : undefined }).then(r => r.data),

  create: (data: CreateTagInput) =>
    client.post<Tag>('/tags', data).then(r => r.data),

  update: (id: string, data: UpdateTagInput) =>
    client.patch<Tag>(`/tags/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    client.delete(`/tags/${id}`).then(r => r.data),
};
