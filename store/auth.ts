import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    localStorage.setItem('vd_token', token);
    localStorage.setItem('vd_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('vd_token');
    localStorage.removeItem('vd_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => {
    localStorage.setItem('vd_user', JSON.stringify(user));
    set({ user });
  },
}));
