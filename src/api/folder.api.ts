import client from './client';
import type { Folder } from '../types/folder.types';

export interface CreateFolderInput {
  name: string;
}

export interface UpdateFolderInput {
  name?: string;
}

export const folderApi = {
  getAll: () => client.get<Folder[]>('/folders').then(r => r.data),

  create: (data: CreateFolderInput) =>
    client.post<Folder>('/folders', data).then(r => r.data),

  update: (id: string, data: UpdateFolderInput) =>
    client.patch<Folder>(`/folders/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    client.delete(`/folders/${id}`).then(r => r.data),
};
