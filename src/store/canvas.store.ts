import { create } from 'zustand';

interface CanvasStore {
  panX: number;
  panY: number;
  zoom: number;
  selectedNodeId: string | null;
  expandedNodes: Set<string>;
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  selectNode: (id: string | null) => void;
  toggleExpand: (id: string) => void;
  resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  panX: 60,
  panY: 80,
  zoom: 1,
  selectedNodeId: null,
  expandedNodes: new Set(),

  setPan: (panX, panY) => set({ panX, panY }),

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.3), 2.0) }),

  selectNode: (id) => set({ selectedNodeId: id }),

  toggleExpand: (id) => {
    const expanded = new Set(get().expandedNodes);
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    set({ expandedNodes: expanded });
  },

  resetCanvas: () => set({ panX: 60, panY: 80, zoom: 1, selectedNodeId: null }),
}));
