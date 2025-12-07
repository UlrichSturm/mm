'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useKeycloak } from './KeycloakProvider';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVendor?: boolean;
}

export function ProtectedRoute({ children, requireVendor = false }: ProtectedRouteProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useKeycloak();
  const hasRedirected = useRef(false);
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    // Don't do anything if still loading
    if (isLoading) {
      return;
    }

    // Don't redirect if we're already on login page
    if (pathname?.startsWith('/auth/login')) {
      return;
    }

    // Reset redirect flag if pathname changed (user navigated)
    if (pathname !== lastPathname.current) {
      hasRedirected.current = false;
      lastPathname.current = pathname;
    }

    // Prevent multiple redirect attempts for the same pathname
    if (hasRedirected.current) {
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      hasRedirected.current = true;
      // Use window.location to avoid React Router state updates
      window.location.href = '/auth/login';
      return;
    }

    // Check vendor role if required
    if (requireVendor && user) {
      const userRoles = (user as { roles?: string[] })?.roles || [];
      const hasVendorRole = userRoles.includes('vendor') || userRoles.includes('lawyer-notary');
      if (!hasVendorRole) {
        hasRedirected.current = true;
        // Use window.location to avoid React Router state updates
        window.location.href = '/auth/login';
        return;
      }
    }
  }, [isAuthenticated, isLoading, pathname]); // Minimal dependencies

  // Show loading state
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

  // Don't render anything if redirect is in progress
  if (hasRedirected.current) {
    return null;
  }

  // Check authentication
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Check vendor role if required
  if (requireVendor && user) {
    const userRoles = (user as { roles?: string[] })?.roles || [];
    const hasVendorRole = userRoles.includes('vendor') || userRoles.includes('lawyer-notary');
    if (!hasVendorRole) {
      return null; // Will redirect in useEffect
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

