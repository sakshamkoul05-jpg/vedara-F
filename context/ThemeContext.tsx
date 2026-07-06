'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useThemeStore } from '@/store/theme';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  toggle: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'system', resolvedTheme: 'light', toggle: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, resolvedTheme, toggle, setTheme } = useThemeStore();
  return <ThemeContext.Provider value={{ theme, resolvedTheme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
