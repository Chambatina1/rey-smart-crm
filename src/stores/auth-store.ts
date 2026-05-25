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
    language?: Language;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
  checkAuth: () => Promise<void>;
}

// Retry helper for cold-start compilation issues
async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1500): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      // If it's a 500, it might be cold start — retry
      if (res.status === 500 && i < retries) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (i < retries) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries reached');
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    try {
      const res = await fetchWithRetry('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Invalid email or password' };
      }
      const data = await res.json();
      localStorage.setItem('rss_token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const res = await fetchWithRetry('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'client' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          return { success: false, error: 'This email is already registered. Try signing in instead.' };
        }
        return { success: false, error: data.error || 'Registration failed. Please try again.' };
      }
      const data = await res.json();
      localStorage.setItem('rss_token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Connection error. Please check your internet and try again.' };
    }
  },

  logout: () => {
    localStorage.removeItem('rss_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    set({ isLoading: true });
    let token: string | null = null;
    try { token = localStorage.getItem('rss_token'); } catch { /* SSR guard */ }
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const res = await fetchWithRetry('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        try { localStorage.removeItem('rss_token'); } catch { /* SSR guard */ }
        set({ isLoading: false, isAuthenticated: false, user: null, token: null });
        return;
      }
      const data = await res.json();
      if (data.user) {
        set({ user: data.user, token, isAuthenticated: true, isLoading: false });
      } else {
        try { localStorage.removeItem('rss_token'); } catch { /* SSR guard */ }
        set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      }
    } catch {
      // On network error, stop loading but keep token for later retry
      set({ isLoading: false });
    }
  },
}));
