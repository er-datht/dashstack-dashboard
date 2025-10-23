/**
 * Authentication Type Definitions
 * Types related to Login and authentication
 */

import type { User } from "./common";

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type PasswordReset = {
  email: string;
};

export type PasswordResetConfirm = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};
