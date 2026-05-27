import { create } from 'zustand';

export type Theme = 'dark' | 'white' | 'grey';

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('stratanodex-theme', t);
}

const stored = (localStorage.getItem('stratanodex-theme') as Theme) || 'dark';
// Apply immediately so the first paint uses the correct theme
applyTheme(stored);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: stored,
  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
}));
