'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { VendorHeader } from '@/components/layout/VendorHeader';
import { VendorSidebar } from '@/components/layout/VendorSidebar';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    const isLoginPage = pathname?.startsWith('/auth/login');
    
    if (!token && !isLoginPage) {
      // Не авторизован и не на странице логина - редирект
      router.replace('/auth/login');
      return;
    }

    if (token && isLoginPage) {
      // Авторизован и на странице логина - редирект на главную
      router.replace('/');
      return;
    }

    setIsAuthenticated(!!token);
  }, [pathname, router]);

  // Показываем загрузку пока проверяем аутентификацию
  if (isAuthenticated === null && !pathname?.startsWith('/auth/login')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // На странице логина не показываем sidebar и header
  if (pathname?.startsWith('/auth/login')) {
    return <>{children}</>;
  }

  // Для остальных страниц показываем полный layout
  return (
    <div className="flex min-h-screen bg-background">
      <VendorSidebar />
      <div className="flex-1 flex flex-col">
        <VendorHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}


