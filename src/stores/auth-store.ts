import { create } from 'zustand';
import type { Language } from '@/lib/i18n';

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    avatar?: string;
    language: Language;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('rss_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('rss_token') : false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('rss_token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'client' }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('rss_token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('rss_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    const token = localStorage.getItem('rss_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem('rss_token');
        set({ isLoading: false, isAuthenticated: false, user: null, token: null });
        return;
      }
      const data = await res.json();
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
