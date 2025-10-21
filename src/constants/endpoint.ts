export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
  },
  USERS: {
    LIST: "/users",
    DETAIL: (id: string | number) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id: string | number) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
  },
  ORDERS: {
    LIST: "/orders",
    DETAIL: (id: string | number) => `/orders/${id}`,
    CREATE: "/orders",
    UPDATE: (id: string | number) => `/orders/${id}`,
    DELETE: (id: string | number) => `/orders/${id}`,
  },
} as const;
