'use client';

import { withAuth } from '@/middleware/withAuth';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from './ErrorBoundary';

function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

export default withAuth(RootLayoutWrapper);