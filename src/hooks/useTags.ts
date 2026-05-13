import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi, CreateTagInput, UpdateTagInput } from '../api/tag.api';
import type { Tag } from '../types/tag.types';

const TAGS_KEY = 'tags';

export function useTags(listId?: string) {
  return useQuery<Tag[], Error>({
    queryKey: [TAGS_KEY, listId ?? 'global'],
    queryFn: () => tagApi.getAll(listId),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<Tag, Error, CreateTagInput>({
    mutationFn: tagApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<Tag, Error, { id: string; data: UpdateTagInput }>({
    mutationFn: ({ id, data }) => tagApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: tagApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}
