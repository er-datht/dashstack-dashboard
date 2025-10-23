/**
 * Common Type Definitions
 * Shared types and interfaces used across the application
 */

// Common Types
export type ID = string | number;

export type Status = "idle" | "loading" | "success" | "error";

export type Theme = "light" | "dark";

// API Response Types
export type ApiResponse<T> = {
  data: T;
  message?: string;
  status: number;
};

export type ApiError = {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
};

// User Types
export type User = {
  id: ID;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type UserRole = "admin" | "user" | "guest";

// Pagination Types
export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  order?: "asc" | "desc";
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Form Types
export type FormField = {
  name: string;
  value: string | number | boolean;
  error?: string;
  touched?: boolean;
};
