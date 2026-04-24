import type { ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredToken } from '../services/auth';

/**
 * Higher-Order Component for Authentication
 * Wraps a component to require authentication before rendering.
 * Redirects unauthenticated users to /login, preserving the original location.
 *
 * @example
 * const ProtectedComponent = withAuth(MyComponent);
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  const WithAuth = (props: P) => {
    const location = useLocation();
    const token = getStoredToken();

    if (!token) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Component {...props} />;
  };

  WithAuth.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WithAuth;
}
