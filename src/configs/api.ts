import axios from "axios";
import { appConfig } from "./app-config";

/**
 * Axios Instance Configuration
 * Create and configure axios instance with interceptors
 */

// Create axios instance
export const apiClient = axios.create({
  baseURL: appConfig.api.baseURL,
  timeout: appConfig.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem(appConfig.auth.tokenKey);

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log("🚀 Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error("❌ Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log("✅ Response:", response.status, response.config.url);
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(
        "❌ Response Error:",
        error.response?.status,
        error.config?.url
      );
    }

    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem(appConfig.auth.tokenKey);
          localStorage.removeItem(appConfig.auth.refreshTokenKey);
          window.location.href = appConfig.routes.login;
          break;

        case 403:
          // Forbidden
          console.error("Access forbidden");
          break;

        case 404:
          // Not found
          console.error("Resource not found");
          break;

        case 500:
          // Server error
          console.error("Internal server error");
          break;

        default:
          console.error("An error occurred");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received from server");
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
