'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useThemeStore } from '@/store/theme';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  resolved: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', resolved: 'light', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, resolved, toggle } = useThemeStore();
  return <ThemeContext.Provider value={{ theme, resolved, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
