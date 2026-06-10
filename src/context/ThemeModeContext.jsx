import { createContext, useContext, useMemo, useState } from 'react';
import { buildTheme } from '../styles/theme';

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'light');
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const toggleMode = () => setMode((current) => {
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('mode', next);
    return next;
  });

  const value = useMemo(() => ({ mode, theme, toggleMode }), [mode, theme]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export const useThemeMode = () => useContext(ThemeModeContext);
