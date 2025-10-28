/**
 * Theme Utility Functions
 *
 * Helper functions to work with theme values and make theme-related
 * code more readable and maintainable.
 */

import { THEMES } from "../constants/common";

/**
 * Type for theme values
 */
export type ThemeValue = typeof THEMES.LIGHT | typeof THEMES.DARK;

/**
 * Check if current theme is dark mode
 * @param theme - Current theme value
 * @returns true if theme is dark, false otherwise
 */
export const isDarkTheme = (theme: ThemeValue): boolean => {
  return theme === THEMES.DARK;
};

/**
 * Check if current theme is light mode
 * @param theme - Current theme value
 * @returns true if theme is light, false otherwise
 */
export const isLightTheme = (theme: ThemeValue): boolean => {
  return theme === THEMES.LIGHT;
};

/**
 * Get the opposite theme value
 * @param theme - Current theme value
 * @returns The opposite theme
 */
export const getOppositeTheme = (theme: ThemeValue): ThemeValue => {
  return theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
};

/**
 * Get a value based on current theme
 * @param theme - Current theme value
 * @param lightValue - Value to return in light mode
 * @param darkValue - Value to return in dark mode
 * @returns The appropriate value based on theme
 */
export const getThemeValue = <T>(
  theme: ThemeValue,
  lightValue: T,
  darkValue: T
): T => {
  return isDarkTheme(theme) ? darkValue : lightValue;
};

/**
 * Check if system prefers dark mode
 * @returns true if system prefers dark color scheme
 */
export const systemPrefersDark = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Get system preferred theme
 * @returns THEMES.DARK if system prefers dark, THEMES.LIGHT otherwise
 */
export const getSystemTheme = (): ThemeValue => {
  return systemPrefersDark() ? THEMES.DARK : THEMES.LIGHT;
};

/**
 * Apply theme class to DOM elements
 * @param theme - Theme to apply
 * @param elements - Elements to apply theme to (defaults to html and body)
 */
export const applyThemeToDOM = (
  theme: ThemeValue,
  elements: HTMLElement[] = [document.documentElement, document.body]
): void => {
  const isDark = isDarkTheme(theme);

  elements.forEach((element) => {
    if (isDark) {
      element.classList.add(THEMES.DARK);
      element.classList.remove(THEMES.LIGHT);
    } else {
      element.classList.add(THEMES.LIGHT);
      element.classList.remove(THEMES.DARK);
    }
  });
};

/**
 * Remove theme classes from DOM elements
 * @param elements - Elements to remove theme from
 */
export const removeThemeFromDOM = (
  elements: HTMLElement[] = [document.documentElement, document.body]
): void => {
  elements.forEach((element) => {
    element.classList.remove(THEMES.DARK, THEMES.LIGHT);
  });
};
