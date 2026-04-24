/**
 * Authentication Service
 * Handles login, registration, and token management
 */

import type { LoginCredentials, AuthResponse, RegisterData } from '../types/auth';
import { appConfig } from '../configs/app-config';

/**
 * Simulate a network delay between min and max milliseconds
 */
function simulateDelay(min = 800, max = 1200): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Mock login - authenticates with simulated delay
 * Returns a mock AuthResponse with user data and tokens
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await simulateDelay();

  const registered = localStorage.getItem(REGISTERED_USER_KEY);
  const registeredUser = registered ? JSON.parse(registered) : null;
  const userName = registeredUser?.email === credentials.email ? registeredUser.name : credentials.email.split('@')[0];

  return {
    user: {
      id: '1',
      name: userName,
      email: credentials.email,
      role: 'admin',
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    token: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expiresIn: 3600000,
  };
}

/**
 * Mock register - creates account with simulated delay
 */
export async function register(
  data: RegisterData
): Promise<{ success: boolean; message: string }> {
  await simulateDelay();

  localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify({ name: data.name, email: data.email }));

  return {
    success: true,
    message: 'Registration successful',
  };
}

/**
 * Retrieve stored auth token from localStorage or sessionStorage
 */
export function getStoredToken(): string | null {
  const localToken = localStorage.getItem(appConfig.auth.tokenKey);
  if (localToken) return localToken;

  const sessionToken = sessionStorage.getItem(appConfig.auth.tokenKey);
  if (sessionToken) return sessionToken;

  return null;
}

/**
 * Store auth tokens in the specified storage
 */
export function storeTokens(
  token: string,
  refreshToken: string,
  storage: 'local' | 'session'
): void {
  const store = storage === 'local' ? localStorage : sessionStorage;
  store.setItem(appConfig.auth.tokenKey, token);
  store.setItem(appConfig.auth.refreshTokenKey, refreshToken);
}

const USER_STORAGE_KEY = 'auth_user';
const REGISTERED_USER_KEY = 'registered_user';

/**
 * Store user data in the same storage as tokens
 */
export function storeUser(user: { name: string; email: string; role: string }, storage: 'local' | 'session'): void {
  const store = storage === 'local' ? localStorage : sessionStorage;
  store.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Retrieve stored user data from localStorage or sessionStorage
 */
export function getStoredUser(): { name: string; email: string; role: string } | null {
  const localUser = localStorage.getItem(USER_STORAGE_KEY);
  if (localUser) return JSON.parse(localUser);

  const sessionUser = sessionStorage.getItem(USER_STORAGE_KEY);
  if (sessionUser) return JSON.parse(sessionUser);

  return null;
}

/**
 * Clear auth tokens and user data from both localStorage and sessionStorage
 */
export function clearTokens(): void {
  localStorage.removeItem(appConfig.auth.tokenKey);
  localStorage.removeItem(appConfig.auth.refreshTokenKey);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(REGISTERED_USER_KEY);
  sessionStorage.removeItem(appConfig.auth.tokenKey);
  sessionStorage.removeItem(appConfig.auth.refreshTokenKey);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}
