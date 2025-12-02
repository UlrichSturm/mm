/**
 * Authentication utilities for client application
 */

import { getCookie } from './cookies';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return getCookie('authToken') || localStorage.getItem('authToken');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Delete cookie
  document.cookie = 'authToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  window.location.href = '/';
}
