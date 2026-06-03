import { create } from 'zustand';
import type { AiMessage } from '../api/ai.api';

interface AiChatStore {
  isOpen: boolean;
  messages: AiMessage[];
  isLoading: boolean;

  toggle: () => void;
  open: () => void;
  close: () => void;
  addMessage: (msg: AiMessage) => void;
  setLoading: (v: boolean) => void;
  clearHistory: () => void;
}

const MAX_MESSAGES = 20; // 10 turns

export const useAiChatStore = create<AiChatStore>((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, msg].slice(-MAX_MESSAGES),
    })),

  setLoading: (v) => set({ isLoading: v }),
  clearHistory: () => set({ messages: [] }),
}));
