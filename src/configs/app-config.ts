/**
 * Application Configuration
 * Central location for app-wide configuration settings
 */

export const appConfig = {
  // Application Info
  app: {
    name: "DashStack",
    version: "1.0.0",
    description: "Modern React Dashboard",
  },

  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    timeout: 30000, // 30 seconds
  },

  // Authentication
  auth: {
    tokenKey: "auth_token",
    refreshTokenKey: "refresh_token",
    tokenExpiry: 3600000, // 1 hour in milliseconds
  },

  // Theme
  theme: {
    defaultTheme: "light" as "light" | "dark",
    storageKey: "theme",
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Features Flags
  features: {
    enableDarkMode: true,
    enableNotifications: true,
    enableAnalytics: false,
  },

  // Routes
  routes: {
    home: "/",
    dashboard: "/dashboard",
    login: "/login",
    products: "/products",
    orders: "/orders",
    settings: "/settings",
  },
} as const;

export type AppConfig = typeof appConfig;
