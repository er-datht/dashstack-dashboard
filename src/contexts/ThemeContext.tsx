import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { THEMES, STORAGE_KEYS } from "../constants/common";

type Theme = (typeof THEMES)[keyof typeof THEMES];

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;

    // Check system preference if no saved theme
    if (!savedTheme) {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return systemPrefersDark ? THEMES.DARK : THEMES.LIGHT;
    }
    return savedTheme;
  });

  useEffect(() => {
    // Apply theme to document root and body
    const root = document.documentElement;
    const body = document.body;

    if (theme === THEMES.DARK) {
      root.classList.add(THEMES.DARK);
      body.classList.add(THEMES.DARK);
    } else {
      root.classList.remove(THEMES.DARK);
      body.classList.remove(THEMES.DARK);
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
