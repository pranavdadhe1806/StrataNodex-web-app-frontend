import { create } from 'zustand';
import type { AiMessage, AiSession, AiSessionMessage } from '../api/ai.api';

// Re-export so components can import from one place
export type { AiMessage };

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatStore {
  isOpen: boolean;
  isLoading: boolean;

  // Active session
  activeSessionId: string | null;
  messages: DisplayMessage[]; // messages for the currently visible session

  // Session list (shown in the history panel)
  sessions: AiSession[];
  showSessionList: boolean;

  // Actions — panel
  toggle: () => void;
  open: () => void;
  close: () => void;
  setLoading: (v: boolean) => void;

  // Actions — messages
  addMessage: (msg: DisplayMessage) => void;
  setMessages: (msgs: (AiSessionMessage | DisplayMessage)[]) => void;
  clearMessages: () => void;

  // Actions — sessions
  setSessions: (sessions: AiSession[]) => void;
  setActiveSessionId: (id: string | null) => void;
  toggleSessionList: () => void;
  addSessionToList: (session: AiSession) => void;
  removeSessionFromList: (id: string) => void;
}

export const useAiChatStore = create<AiChatStore>((set) => ({
  isOpen: false,
  isLoading: false,

  activeSessionId: null,
  messages: [],

  sessions: [],
  showSessionList: false,

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setLoading: (v) => set({ isLoading: v }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setMessages: (msgs) =>
    set({ messages: msgs.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })) }),

  clearMessages: () => set({ messages: [] }),

  setSessions: (sessions) => set({ sessions }),

  setActiveSessionId: (id) => set({ activeSessionId: id }),

  toggleSessionList: () => set((s) => ({ showSessionList: !s.showSessionList })),

  addSessionToList: (session) =>
    set((s) => ({ sessions: [session, ...s.sessions] })),

  removeSessionFromList: (id) =>
    set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) })),
}));
