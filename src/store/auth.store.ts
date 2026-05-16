import { create } from 'zustand';
import type { User } from '../types/auth.types';
import { clearToken, setToken as setTokenUtil } from '../utils/token';

// In dev, redirect to local landing page; in prod, to deployed Vercel app
const LANDING_AUTH_URL =
  import.meta.env.VITE_LANDING_URL
    ? `${import.meta.env.VITE_LANDING_URL}/#auth`
    : 'https://stratanodex-landing-page.vercel.app/#auth';

interface AuthStore {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  setToken: (token) => {
    setTokenUtil(token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    clearToken();
    set({ token: null, user: null });
    window.location.href = LANDING_AUTH_URL;
  },
}));
