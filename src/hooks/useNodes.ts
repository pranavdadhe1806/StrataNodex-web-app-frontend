import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  nodeApi,
  CreateNodeInput,
  CreateSubNodeInput,
  UpdateNodeInput,
  MoveNodeInput,
} from '../api/node.api';
import type { Node } from '../types/node.types';

const NODES_KEY = 'nodes';
const LISTS_KEY = 'lists';

export function useNodes(listId: string | null) {
  return useQuery<Node[], Error>({
    queryKey: [NODES_KEY, listId],
    queryFn: () => {
      if (!listId) throw new Error('List ID is required');
      return nodeApi.getByList(listId);
    },
    enabled: !!listId,
  });
}

export function useNode(nodeId: string | null) {
  return useQuery<Node, Error>({
    queryKey: [NODES_KEY, 'detail', nodeId],
    queryFn: () => {
      if (!nodeId) throw new Error('Node ID is required');
      return nodeApi.getOne(nodeId);
    },
    enabled: !!nodeId,
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();

  return useMutation<Node, Error, { listId: string; data: CreateNodeInput }>({
    mutationFn: ({ listId, data }) => nodeApi.create(listId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [NODES_KEY, variables.listId] });
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY] });
    },
  });
}

export function useCreateSubNode() {
  const queryClient = useQueryClient();

  return useMutation<Node, Error, { parentId: string; data: CreateSubNodeInput }>({
    mutationFn: ({ parentId, data }) => nodeApi.createChild(parentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NODES_KEY] });
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY] });
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();

  return useMutation<Node, Error, { id: string; data: UpdateNodeInput }>({
    mutationFn: ({ id, data }) => nodeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NODES_KEY] });
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: nodeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NODES_KEY] });
      queryClient.invalidateQueries({ queryKey: [LISTS_KEY] });
    },
  });
}

export function useMoveNode() {
  const queryClient = useQueryClient();

  return useMutation<Node, Error, { id: string; data: MoveNodeInput }>({
    mutationFn: ({ id, data }) => nodeApi.move(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NODES_KEY] });
    },
  });
}

export function useAttachTag() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { nodeId: string; tagId: string }>({
    mutationFn: ({ nodeId, tagId }) => nodeApi.attachTag(nodeId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NODES_KEY] });
    },
  });
}

export function useDetachTag() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { nodeId: string; tagId: string }>({
    mutationFn: ({ nodeId, tagId }) => nodeApi.detachTag(nodeId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NODES_KEY] });
    },
  });
}
