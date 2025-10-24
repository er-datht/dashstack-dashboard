import { useContext } from "react";
import { ThemeContext, type ThemeContextType } from "../contexts/ThemeContext";

/**
 * Custom hook to access theme context
 *
 * @returns Theme context with current theme and toggle function
 * @throws Error if used outside of ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleTheme, isDark, isLight } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *       {isDark && <MoonIcon />}
 *       {isLight && <SunIcon />}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useTheme must be used within a ThemeProvider. " +
        "Make sure your component is wrapped with <ThemeProvider>."
    );
  }

  return context;
}
