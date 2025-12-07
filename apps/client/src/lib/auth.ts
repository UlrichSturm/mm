/**
 * Authentication utilities for client application
 * Now uses Keycloak for authentication
 */

import { getUserInfo, keycloak, isAuthenticated as keycloakIsAuthenticated } from './keycloak';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Get authentication token from Keycloak
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return keycloak.token || localStorage.getItem('authToken');
}

/**
 * Get current user from Keycloak token
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const userInfo = getUserInfo();
  if (!userInfo) {
    return null;
  }

  // Determine role from Keycloak roles
  let role = 'CLIENT';
  if (userInfo.roles.includes('admin')) {
    role = 'ADMIN';
  } else if (userInfo.roles.includes('vendor')) {
    role = 'VENDOR';
  } else if (userInfo.roles.includes('lawyer_notary')) {
    role = 'LAWYER_NOTARY';
  }

  return {
    id: userInfo.id || '',
    email: userInfo.email || '',
    role,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return keycloakIsAuthenticated();
}

/**
 * Logout - redirects to Keycloak logout
 */
export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  keycloak.logout({
    redirectUri: window.location.origin + '/',
  });
}
