import { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { THEMES, STORAGE_KEYS } from "../constants/common";
import {
  getSystemTheme,
  getOppositeTheme,
  applyThemeToDOM,
  type ThemeValue,
  isLightTheme,
  isDarkTheme,
} from "../utils/theme";

/**
 * Theme Context Type Definition
 */
export type ThemeContextType = {
  /** Current active theme */
  theme: ThemeValue;
  /** Toggle between light and dark theme */
  toggleTheme: () => void;
  /** Set a specific theme */
  setTheme: (theme: ThemeValue) => void;
  /** Check if current theme is dark */
  isDark: boolean;
  /** Check if current theme is light */
  isLight: boolean;
};

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Get initial theme from localStorage or system preference
 * @returns The initial theme to use
 */
const getInitialTheme = (): ThemeValue => {
  // Try to get saved theme from localStorage
  const savedTheme = localStorage.getItem(
    STORAGE_KEYS.THEME
  ) as ThemeValue | null;

  if (savedTheme && (isLightTheme(savedTheme) || isDarkTheme(savedTheme))) {
    return savedTheme;
  }

  // Fall back to system preference
  return getSystemTheme();
};

/**
 * Theme Provider Props
 */
type ThemeProviderProps = {
  children: ReactNode;
  /** Optional default theme (overrides system preference) */
  defaultTheme?: ThemeValue;
};

/**
 * Theme Provider Component
 *
 * Provides theme context to the application with the following features:
 * - Persists theme preference to localStorage
 * - Respects system theme preference
 * - Applies theme classes to DOM
 * - Provides theme toggle functionality
 */
export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  // Initialize theme state
  const [theme, setThemeState] = useState<ThemeValue>(() => {
    return defaultTheme || getInitialTheme();
  });

  // Derived state for convenience
  const isDark = isDarkTheme(theme);
  const isLight = isLightTheme(theme);

  /**
   * Set theme and persist to localStorage
   */
  const setTheme = useCallback((newTheme: ThemeValue) => {
    setThemeState(newTheme);
  }, []);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => getOppositeTheme(currentTheme));
  }, []);

  /**
   * Apply theme changes to DOM and localStorage
   */
  useEffect(() => {
    // Apply theme classes to DOM
    applyThemeToDOM(theme);

    // Persist theme to localStorage
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  /**
   * Listen for system theme changes (optional enhancement)
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      const hasUserPreference = localStorage.getItem(STORAGE_KEYS.THEME);
      if (!hasUserPreference) {
        setThemeState(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isDark,
    isLight,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export { ThemeContext };
