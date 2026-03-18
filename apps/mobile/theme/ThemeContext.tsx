import React, { createContext, useContext, useMemo, useState } from 'react';
import { darkColors, lightColors } from './colors';

type ThemeMode = 'light' | 'dark';

const ThemeContext = createContext({
  mode: 'light' as ThemeMode,
  toggleTheme: () => {},
  colors: lightColors
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  const colors = useMemo(() => (mode === 'light' ? lightColors : darkColors), [mode]);

  return <ThemeContext.Provider value={{ mode, toggleTheme, colors }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
