'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];

export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    const pathname = usePathname();
    const isPublicPath = PUBLIC_PATHS.includes(pathname || '');

    useEffect(() => {
      if (loading) return;

      const handleAuth = async () => {
        try {
          // Redirect unauthenticated users to login
          if (!isAuthenticated && !isPublicPath) {
            console.log('Redirecting to login');
            await router.replace('/auth/login');
            return;
          }

          // Redirect authenticated users away from auth pages
          if (isAuthenticated && pathname?.startsWith('/auth/')) {
            console.log('Redirecting to home');
            await router.replace('/');
            return;
          }
        } catch (error) {
          console.error('Navigation error:', error);
        }
      };

      handleAuth();
    }, [isAuthenticated, loading, router, pathname, isPublicPath]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      );
    }
    
    if (isPublicPath) {
      return <Component {...props} />;
    }
    
    // Only render protected routes when authenticated
    return isAuthenticated ? <Component {...props} /> : null;
  };
}