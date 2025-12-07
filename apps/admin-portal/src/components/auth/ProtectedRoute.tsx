'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeycloak } from './KeycloakProvider';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useKeycloak();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    } else if (!isLoading && isAuthenticated && requireAdmin) {
      // Check if user is admin - roles come from Keycloak realm_access.roles
      const userRoles = (user as { roles?: string[] })?.roles || [];
      if (!userRoles.includes('admin')) {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router, requireAdmin, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (requireAdmin) {
    const userRoles = (user as { roles?: string[] })?.roles || [];
    if (!userRoles.includes('admin')) {
      return null; // Will redirect in useEffect
    }
  }

  return <>{children}</>;
}

