export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

let isLoggingOut = false;

export function logout(): void {
  if (typeof window === 'undefined') return;
  
  console.log('[Auth] logout() called, isLoggingOut:', isLoggingOut, 'pathname:', window.location.pathname);
  
  // Предотвращаем множественные вызовы logout
  if (isLoggingOut) {
    console.log('[Auth] Already logging out, skipping');
    return;
  }
  isLoggingOut = true;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  console.log('[Auth] Token and user removed from localStorage');
  
  // Используем replace вместо href, чтобы избежать проблем с историей
  if (window.location.pathname !== '/auth/login') {
    console.log('[Auth] Redirecting to login page');
    window.location.replace('/auth/login');
  } else {
    console.log('[Auth] Already on login page, resetting flag');
    isLoggingOut = false;
  }
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'ADMIN';
}

