// native\src\context\ThemeContext.tsx

import { createContext, useState } from 'react';
import { COLORS } from '../styles/global';

type Theme = 'light' | 'dark';

export const ThemeContext = createContext({
  theme: 'dark' as Theme,
  colors: COLORS.dark,
  toggle: () => { },
});

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [theme, setTheme] =
    useState<Theme>('light');

  const toggle = () => {
    setTheme((prev) => {
      const next =
        prev === 'dark'
          ? 'light'
          : 'dark';

      return next;
    });
  };

  const colors =
    theme === 'dark'
      ? COLORS.dark
      : COLORS.light;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};