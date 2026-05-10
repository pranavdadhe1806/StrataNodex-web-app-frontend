import { create } from 'zustand';
import type { User } from '../types/auth.types';
import { clearToken, setToken as setTokenUtil } from '../utils/token';

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
    window.location.href = 'https://stratanodex-landing-page.vercel.app/#auth';
  },
}));
