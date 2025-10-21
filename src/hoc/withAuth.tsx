import type { ComponentType } from 'react';

/**
 * Higher-Order Component for Authentication
 * Wraps a component to add authentication logic
 *
 * @example
 * const ProtectedComponent = withAuth(MyComponent);
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  const WithAuth = (props: P) => {
    // TODO: Implement actual authentication logic
    // For now, this is a placeholder

    const isAuthenticated = true; // Replace with real auth check

    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      return <div>Unauthorized - Please log in</div>;
    }

    return <Component {...props} />;
  };

  WithAuth.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WithAuth;
}
