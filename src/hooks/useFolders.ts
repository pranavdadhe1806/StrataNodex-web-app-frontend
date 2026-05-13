import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folderApi, CreateFolderInput, UpdateFolderInput } from '../api/folder.api';
import type { Folder } from '../types/folder.types';

const FOLDERS_KEY = 'folders';

export function useFolders() {
  return useQuery<Folder[], Error>({
    queryKey: [FOLDERS_KEY],
    queryFn: folderApi.getAll,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation<Folder, Error, CreateFolderInput>({
    mutationFn: folderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation<Folder, Error, { id: string; data: UpdateFolderInput }>({
    mutationFn: ({ id, data }) => folderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: folderApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY] });
    },
  });
}
