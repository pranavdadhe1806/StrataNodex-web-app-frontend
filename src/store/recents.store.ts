import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_RECENTS = 10;

export type RecentType = 'folder' | 'list';

export interface RecentEntry {
  id: string;
  name: string;
  type: RecentType;
  openedAt: number;
}

interface RecentsStore {
  items: RecentEntry[];
  recordOpen: (entry: Pick<RecentEntry, 'id' | 'name' | 'type'>) => void;
  getEntry: (type: RecentType, id: string) => RecentEntry | undefined;
}

function recentKey(type: RecentType, id: string) {
  return `${type}:${id}`;
}

export const useRecentsStore = create<RecentsStore>()(
  persist(
    (set, get) => ({
      items: [],

      recordOpen: ({ id, name, type }) => {
        const trimmed = name.trim();
        if (!id || !trimmed) return;

        const key = recentKey(type, id);
        const rest = get().items.filter((i) => recentKey(i.type, i.id) !== key);
        const next: RecentEntry[] = [
          { id, name: trimmed, type, openedAt: Date.now() },
          ...rest,
        ].slice(0, MAX_RECENTS);

        set({ items: next });
      },

      getEntry: (type, id) =>
        get().items.find((i) => i.type === type && i.id === id),
    }),
    { name: 'sn_recents' }
  )
);
