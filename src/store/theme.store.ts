import { create } from 'zustand';

export type Theme = 'dark' | 'white' | 'grey';
export type Font = 'Poppins' | 'Inter' | 'JetBrains Mono' | 'Indie Flower';

interface ThemeStore {
  theme: Theme;
  font: Font;
  setTheme: (t: Theme) => void;
  setFont: (f: Font) => void;
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('stratanodex-theme', t);
}

function applyFont(f: Font) {
  const fontMap: Record<Font, string> = {
    'Poppins': "'Poppins', sans-serif",
    'Inter': "'Inter', sans-serif",
    'JetBrains Mono': "'JetBrains Mono', monospace",
    'Indie Flower': "'Indie Flower', cursive",
  };
  document.documentElement.setAttribute('data-font', f);
  document.documentElement.style.setProperty('--font-main', fontMap[f]);
  localStorage.setItem('stratanodex-font', f);
}

const storedTheme = (localStorage.getItem('stratanodex-theme') as Theme) || 'dark';
const storedFont = (localStorage.getItem('stratanodex-font') as Font) || 'Poppins';

// Apply immediately so the first paint uses the correct theme and font
applyTheme(storedTheme);
applyFont(storedFont);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: storedTheme,
  font: storedFont,
  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
  setFont: (f) => {
    applyFont(f);
    set({ font: f });
  },
}));
