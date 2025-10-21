// API Configuration
export const VITE_API_END_POINT = import.meta.env.VITE_API_BASE_URL;

// Environment
export const NODE_ENV = import.meta.env.MODE;
export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = NODE_ENV === "development";
