import type { QueryClient } from '@tanstack/react-query';
import type { AiOperation } from '../api/ai.api';
import { folderApi } from '../api/folder.api';
import { listApi } from '../api/list.api';
import { nodeApi } from '../api/node.api';
import { tagApi } from '../api/tag.api';

/**
 * Resolve {{id_of_TITLE}} placeholders in an operation using the idMap
 * built from previously executed operations in this batch.
 */
function resolvePlaceholders(
  op: AiOperation,
  idMap: Map<string, string>,
): AiOperation {
  const resolved = { ...op };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string' && value.startsWith('{{id_of_') && value.endsWith('}}')) {
      const title = value.slice(8, -2); // strip {{id_of_ and }}
      const realId = idMap.get(title);
      if (realId) {
        (resolved as Record<string, unknown>)[key] = realId;
      }
    }
  }
  return resolved;
}

/**
 * Execute AI operations sequentially using existing API calls.
 * Returns a map of created title → real ID for reference.
 */
export async function executeOperations(
  ops: AiOperation[],
  queryClient: QueryClient,
): Promise<void> {
  const idMap = new Map<string, string>();

  for (const rawOp of ops) {
    const op = resolvePlaceholders(rawOp, idMap);

    switch (op.op) {
      case 'createFolder': {
        const folder = await folderApi.create({ name: op.title as string });
        idMap.set(op.title as string, folder.id);
        break;
      }

      case 'createList': {
        const list = await listApi.create({
          name: op.title as string,
          folderId: op.folderId as string,
        });
        idMap.set(op.title as string, list.id);
        break;
      }

      case 'createNode': {
        const parentId = (op.parentId as string | null) ?? null;
        const listId = op.listId as string;

        // Build optional properties
        const extras: Record<string, unknown> = {};
        if (op.status) extras.status = op.status;
        if (op.priority) extras.priority = op.priority;
        if (op.startAt) extras.startAt = op.startAt;
        if (op.endAt) extras.endAt = op.endAt;
        if (op.notes) extras.notes = op.notes;
        if (op.position !== undefined) extras.position = op.position;

        if (parentId) {
          const node = await nodeApi.createChild(parentId, {
            title: op.title as string,
            ...extras,
          });
          idMap.set(op.title as string, node.id);
        } else {
          const node = await nodeApi.create(listId, {
            title: op.title as string,
            listId,
            ...extras,
          });
          idMap.set(op.title as string, node.id);
        }
        break;
      }

      case 'updateNode': {
        const data: Record<string, unknown> = {};
        if (op.title !== undefined) data.title = op.title;
        if (op.status !== undefined) data.status = op.status;
        if (op.priority !== undefined) data.priority = op.priority;
        if (op.startAt !== undefined) data.startAt = op.startAt;
        if (op.endAt !== undefined) data.endAt = op.endAt;
        if (op.notes !== undefined) data.notes = op.notes;
        await nodeApi.update(op.nodeId as string, data);
        break;
      }

      case 'deleteNode': {
        await nodeApi.delete(op.nodeId as string);
        break;
      }

      case 'moveNode': {
        const moveData: Record<string, unknown> = {};
        if (op.newParentId !== undefined) moveData.parentId = op.newParentId;
        if (op.newListId !== undefined) moveData.listId = op.newListId;
        await nodeApi.update(op.nodeId as string, moveData);
        break;
      }

      case 'createTag': {
        const tag = await tagApi.create({
          name: op.name as string,
          listId: (op.listId as string | undefined) ?? undefined,
        });
        idMap.set(op.name as string, tag.id);
        break;
      }

      case 'assignTag': {
        // Resolve tag by name from idMap or use tagId directly
        const tagId = (op.tagId as string) || idMap.get(op.tagName as string);
        if (tagId) {
          await nodeApi.attachTag(op.nodeId as string, tagId);
        }
        break;
      }

      default:
        console.warn(`Unknown AI operation: ${op.op}`);
    }
  }

  // Invalidate all relevant queries so the UI refreshes
  queryClient.invalidateQueries({ queryKey: ['folders'] });
  queryClient.invalidateQueries({ queryKey: ['lists'] });
  queryClient.invalidateQueries({ queryKey: ['nodes'] });
  queryClient.invalidateQueries({ queryKey: ['tags'] });
}
