import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggle: () => void;
  setTheme: (theme: Theme) => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',
  toggle: () => {
    const current = get().resolvedTheme;
    const next: Theme = current === 'light' ? 'dark' : 'light';
    const resolved = resolveTheme(next);
    applyTheme(resolved);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vd_theme', next);
    }
    set({ theme: next, resolvedTheme: resolved });
  },
  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vd_theme', theme);
    }
    set({ theme, resolvedTheme: resolved });
  },
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('vd_theme') as Theme | null;
    const theme = stored || 'system';
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });

    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      const current = get().theme;
      if (current === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        set({ resolvedTheme: newResolved });
      }
    });
  },
}));
