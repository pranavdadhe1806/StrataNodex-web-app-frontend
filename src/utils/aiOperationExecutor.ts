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

/** Collect optional node fields from an operation object */
function pickNodeExtras(op: AiOperation): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  if (op.status !== undefined) extras.status = op.status;
  if (op.priority !== undefined) extras.priority = op.priority;
  if (op.startAt !== undefined) extras.startAt = op.startAt;
  if (op.endAt !== undefined) extras.endAt = op.endAt;
  if (op.reminderAt !== undefined) extras.reminderAt = op.reminderAt;
  if (op.notes !== undefined) extras.notes = op.notes;
  if (op.position !== undefined) extras.position = op.position;
  if (op.tagIds !== undefined) extras.tagIds = op.tagIds;
  return extras;
}

/**
 * Execute AI operations sequentially using existing API calls.
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
        const extras = pickNodeExtras(op);

        if (parentId) {
          // If parentId is specified, use the createChild endpoint
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

      case 'createSubNode': {
        const extras = pickNodeExtras(op);
        const node = await nodeApi.createChild(op.parentId as string, {
          title: op.title as string,
          ...extras,
        });
        idMap.set(op.title as string, node.id);
        break;
      }

      case 'updateNode': {
        const data: Record<string, unknown> = {};
        if (op.title !== undefined) data.title = op.title;
        if (op.status !== undefined) data.status = op.status;
        if (op.priority !== undefined) data.priority = op.priority;
        if (op.startAt !== undefined) data.startAt = op.startAt;
        if (op.endAt !== undefined) data.endAt = op.endAt;
        if (op.reminderAt !== undefined) data.reminderAt = op.reminderAt;
        if (op.notes !== undefined) data.notes = op.notes;
        if (op.position !== undefined) data.position = op.position;
        if (op.parentId !== undefined) data.parentId = op.parentId;
        if (op.tagIds !== undefined) data.tagIds = op.tagIds;
        await nodeApi.update(op.nodeId as string, data);
        break;
      }

      case 'deleteNode': {
        await nodeApi.delete(op.nodeId as string);
        break;
      }

      case 'moveNode': {
        await nodeApi.move(op.nodeId as string, {
          parentId: (op.parentId as string | null) ?? null,
          position: (op.position as number) ?? 0,
        });
        break;
      }

      case 'createTag': {
        const tagData: { name: string; color?: string; listId?: string | null } = {
          name: op.name as string,
        };
        if (op.color) tagData.color = op.color as string;
        if (op.listId !== undefined) tagData.listId = op.listId as string | null;
        const tag = await tagApi.create(tagData);
        idMap.set(op.name as string, tag.id);
        break;
      }

      case 'attachTag': {
        const tagId = (op.tagId as string) || idMap.get(op.tagName as string || '');
        if (tagId) {
          await nodeApi.attachTag(op.nodeId as string, tagId);
        }
        break;
      }

      case 'detachTag': {
        await nodeApi.detachTag(op.nodeId as string, op.tagId as string);
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
