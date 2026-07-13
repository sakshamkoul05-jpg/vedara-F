import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolved: 'light' | 'dark';
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  resolved: 'light',
  toggle: () => set((state) => {
    const cycle: Theme[] = ['light', 'dark', 'system'];
    const next = cycle[(cycle.indexOf(state.theme) + 1) % cycle.length];
    const resolved = resolveTheme(next);
    applyTheme(resolved);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vd_theme', next);
    }
    return { theme: next, resolved };
  }),
  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vd_theme', theme);
    }
    set({ theme, resolved });
  },
}));
