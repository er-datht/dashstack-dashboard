// Theme Constants
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

// Status Constants
export const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: "theme",
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM DD, YYYY",
  TIME: "HH:mm:ss",
  DATETIME: "MM/DD/YYYY HH:mm:ss",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE: "Successfully saved!",
  UPDATE: "Successfully updated!",
  DELETE: "Successfully deleted!",
  CREATE: "Successfully created!",
} as const;

// Pagination
export const PAGINATION_DEFAULT = 50;

// Theme Color Values - for programmatic use (charts, dynamic styles, etc.)
// These match the CSS custom properties in index.css
export const THEME_COLORS = {
  // Primary Colors
  PRIMARY: "#4880ff",
  PRIMARY_LIGHT: "#6691ff",
  PRIMARY_DARK: "#2b5ff7",

  // Surface Colors (cards, panels, modals)
  SURFACE: "#ffffff", // Light mode
  SURFACE_DARK: "#1a1d24", // Dark mode

  // Background Colors (page layouts)
  BACKGROUND: "#f5f5f7", // Light mode
  BACKGROUND_DARK: "#1e2129", // Dark mode

  // Secondary Surface Colors (inputs, secondary panels)
  SURFACE_SECONDARY: "#f8f9fc", // Light mode
  SURFACE_SECONDARY_DARK: "#242831", // Dark mode

  // Navigation Colors (sidebar, nav bars)
  NAV: "#ffffff", // Light mode
  NAV_DARK: "#15171d", // Dark mode

  // Gray Scale (for charts and dynamic elements)
  // Tailwind's default gray palette
  GRAY: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
} as const;
