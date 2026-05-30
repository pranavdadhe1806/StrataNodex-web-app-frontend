import { create } from 'zustand';

export type Theme = 'dark' | 'white' | 'grey';
export type Font = 'Poppins' | 'Inter' | 'JetBrains Mono' | 'Indie Flower';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, …

interface ThemeStore {
  theme: Theme;
  font: Font;
  dateFormat: DateFormat;
  timeFormat24: boolean;
  weekStartDay: WeekStartDay;
  setTheme: (t: Theme) => void;
  setFont: (f: Font) => void;
  setDateFormat: (f: DateFormat) => void;
  setTimeFormat24: (v: boolean) => void;
  setWeekStartDay: (d: WeekStartDay) => void;
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
const storedDateFormat = (localStorage.getItem('stratanodex-date-format') as DateFormat) || 'DD/MM/YYYY';
const storedTimeFormat24 = localStorage.getItem('stratanodex-time-24') !== 'false'; // default true
const storedWeekStart = parseInt(localStorage.getItem('stratanodex-week-start') ?? '1', 10) as WeekStartDay;

// Apply immediately so the first paint uses the correct theme and font
applyTheme(storedTheme);
applyFont(storedFont);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: storedTheme,
  font: storedFont,
  dateFormat: storedDateFormat,
  timeFormat24: storedTimeFormat24,
  weekStartDay: storedWeekStart,
  setTheme: (t) => { applyTheme(t); set({ theme: t }); },
  setFont: (f) => { applyFont(f); set({ font: f }); },
  setDateFormat: (f) => {
    localStorage.setItem('stratanodex-date-format', f);
    set({ dateFormat: f });
  },
  setTimeFormat24: (v) => {
    localStorage.setItem('stratanodex-time-24', String(v));
    set({ timeFormat24: v });
  },
  setWeekStartDay: (d) => {
    localStorage.setItem('stratanodex-week-start', String(d));
    set({ weekStartDay: d });
  },
}));
