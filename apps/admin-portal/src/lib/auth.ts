export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('auth_token');
}

export function getUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

let isLoggingOut = false;

export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Prevent multiple logout calls
  if (isLoggingOut) {
    return;
  }
  isLoggingOut = true;

  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');

  // Use replace instead of href to avoid history issues
  if (window.location.pathname !== '/auth/login') {
    window.location.replace('/auth/login');
  } else {
    isLoggingOut = false;
  }
}

export function isAdmin(): boolean {
  const user = getUser();
  return (user as { role?: string })?.role === 'ADMIN';
}
