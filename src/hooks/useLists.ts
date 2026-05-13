import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listApi, CreateListInput, UpdateListInput } from '../api/list.api';
import type { List } from '../types/list.types';

const LISTS_KEY = 'lists';

export function useLists(folderId: string | null) {
  return useQuery<List[], Error>({
    queryKey: [LISTS_KEY, folderId],
    queryFn: () => {
      if (!folderId) throw new Error('Folder ID is required');
      return listApi.getByFolder(folderId);
    },
    enabled: !!folderId,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation<List, Error, CreateListInput>({
    mutationFn: listApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY, variables.folderId] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation<List, Error, { id: string; data: UpdateListInput }>({
    mutationFn: ({ id, data }) => listApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: listApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY] });
    },
  });
}
