/**
 * API Service Layer
 * Central location for all API calls and HTTP client configuration
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

/**
 * API Service Methods
 */
export const apiService = {
  // GET request
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchAPI<T>(endpoint, { method: 'GET', ...options }),

  // POST request
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchAPI<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),

  // PUT request
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchAPI<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),

  // PATCH request
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchAPI<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    }),

  // DELETE request
  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchAPI<T>(endpoint, { method: 'DELETE', ...options }),
};

/**
 * Example usage:
 *
 * const users = await apiService.get<User[]>('/users');
 * const newUser = await apiService.post<User>('/users', { name: 'John' });
 */
