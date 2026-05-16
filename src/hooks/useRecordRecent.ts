import { useEffect } from 'react';
import { useRecentsStore, type RecentType } from '../store/recents.store';

/** Records a folder or list open when the user views that screen. */
export function useRecordRecent(
  type: RecentType,
  id: string | undefined,
  name: string | undefined
) {
  const recordOpen = useRecentsStore((s) => s.recordOpen);

  useEffect(() => {
    if (id && name?.trim()) {
      recordOpen({ id, name: name.trim(), type });
    }
  }, [id, name, type, recordOpen]);
}
