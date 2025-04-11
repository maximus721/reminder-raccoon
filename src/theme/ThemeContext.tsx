
import React, { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('app-theme', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Function to apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    setResolvedTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  // Update theme when system preference changes or theme state changes
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(systemTheme);
      } else {
        applyTheme(theme);
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    // Immediately apply theme for a more responsive feel
    if (newTheme !== 'system') {
      applyTheme(newTheme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
