'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/shared/Navigation';
import { KeycloakProvider } from '@/components/auth/KeycloakProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith('/auth/login');

  return (
    <KeycloakProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {isLoginPage ? (
            children
          ) : (
            <ProtectedRoute requireAdmin>{children}</ProtectedRoute>
          )}
        </main>
      </div>
    </KeycloakProvider>
  );
}


