'use client';

import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { VendorHeader } from '@/components/layout/VendorHeader';
import { VendorSidebar } from '@/components/layout/VendorSidebar';

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith('/auth/login');

  // Don't protect login page - render it directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Protect all other pages with ProtectedRoute
  return (
    <ProtectedRoute requireVendor={true}>
      <div className="flex min-h-screen bg-background">
        <VendorSidebar />
        <div className="flex-1 flex flex-col">
          <VendorHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

