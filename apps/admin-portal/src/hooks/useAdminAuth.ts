'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin, logout } from '@/lib/auth';

export function useAdminAuth(redirectToLogin: boolean = true) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      const admin = isAdmin();
      
      setAuthenticated(auth);
      setIsAdminUser(admin);

      if (redirectToLogin && !auth) {
        router.push('/auth/login');
      } else if (redirectToLogin && auth && !admin) {
        // Если пользователь не админ, выходим
        logout();
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectToLogin]);

  return {
    loading,
    authenticated,
    isAdmin: isAdminUser,
    logout,
  };
}

