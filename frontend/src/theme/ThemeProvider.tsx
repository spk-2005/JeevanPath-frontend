import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './theme';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  effective: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const effective = useMemo<'light' | 'dark'>(() => {
    if (mode === 'system') return (system === 'dark' ? 'dark' : 'light');
    return mode;
  }, [mode, system]);

  const value = useMemo(() => ({ mode, setMode, effective }), [mode, effective]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}

export function useAppColors() {
  const { effective } = useThemeMode();
  return effective === 'dark' ? darkColors : lightColors;
}



