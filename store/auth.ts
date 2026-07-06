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

function sanitizeToken(token: string): string {
  return token.replace(/[<>"'`;]/g, '');
}

function setSecureCookie(name: string, value: string, maxAge: number) {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${maxAge}`,
    'SameSite=Lax',
  ];
  if (isSecure) parts.push('Secure');
  document.cookie = parts.join('; ');
}

function clearCookie(name: string) {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const parts = [
    `${name}=`,
    'path=/',
    'max-age=0',
    'SameSite=Lax',
  ];
  if (isSecure) parts.push('Secure');
  document.cookie = parts.join('; ');
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      const safeToken = sanitizeToken(token);
      localStorage.setItem('vd_token', safeToken);
      localStorage.setItem('vd_user', JSON.stringify(user));
      setSecureCookie('vd_token', safeToken, 604800);
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vd_token');
      localStorage.removeItem('vd_user');
      clearCookie('vd_token');
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
        const parsed = JSON.parse(userStr);
        if (parsed && typeof parsed === 'object' && typeof token === 'string' && token.length > 0) {
          set({ user: parsed, token, isAuthenticated: true, hydrated: true });
        } else {
          localStorage.removeItem('vd_token');
          localStorage.removeItem('vd_user');
          set({ hydrated: true });
        }
      } else {
        set({ hydrated: true });
      }
    } catch {
      localStorage.removeItem('vd_token');
      localStorage.removeItem('vd_user');
      set({ hydrated: true });
    }
  },
}));
