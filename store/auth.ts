import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vd_token', token);
      localStorage.setItem('vd_user', JSON.stringify(user));
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `vd_token=${token}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vd_token');
      localStorage.removeItem('vd_user');
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `vd_token=; path=/; max-age=0${isSecure ? '; Secure' : ''}`;
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vd_user', JSON.stringify(user));
    }
    set({ user });
  },
  hydrate: () => {
    try {
      const token = localStorage.getItem('vd_token');
      const userStr = localStorage.getItem('vd_user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
