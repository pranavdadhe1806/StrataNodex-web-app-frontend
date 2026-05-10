import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  detailPanelOpen: boolean;
  activeListId: string | null;
  activeFolderId: string | null;
  activeListName: string | null;
  activeFolderName: string | null;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
  setActiveContext: (params: {
    listId?: string;
    folderId?: string;
    listName?: string;
    folderName?: string;
  }) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  detailPanelOpen: false,
  activeListId: null,
  activeFolderId: null,
  activeListName: null,
  activeFolderName: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  openDetailPanel: () => set({ detailPanelOpen: true }),
  closeDetailPanel: () => set({ detailPanelOpen: false, }),
  setActiveContext: (params) => set({
    activeListId: params.listId ?? null,
    activeFolderId: params.folderId ?? null,
    activeListName: params.listName ?? null,
    activeFolderName: params.folderName ?? null,
  }),
}));
