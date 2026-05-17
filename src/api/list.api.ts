import client from './client';
import type { List } from '../types/list.types';

export interface CreateListInput {
  name: string;
  folderId: string;
}

export interface UpdateListInput {
  name?: string;
  folderId?: string;
}

export const listApi = {
  getByFolder: (folderId: string) =>
    client.get<List[]>(`/folders/${folderId}/lists`).then(r => r.data),

  getById: (listId: string) =>
    client.get<List>(`/lists/${listId}`).then(r => r.data),

  create: (data: CreateListInput) =>
    client.post<List>('/lists', data).then(r => r.data),

  update: (id: string, data: UpdateListInput) =>
    client.patch<List>(`/lists/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    client.delete(`/lists/${id}`).then(r => r.data),
};
