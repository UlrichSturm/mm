/**
 * Shared utilities for API clients
 */

import { getToken } from '../keycloak';

/**
 * Get authentication token from Keycloak or localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try Keycloak token first
  const keycloakToken = getToken();
  if (keycloakToken) {
    return keycloakToken;
  }

  // Fallback to localStorage
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || null;
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = `${API_BASE_URL}/api${endpoint}`;
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - token expired or invalid
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        // Clear token and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
      throw new Error('Session expired. Please log in again.');
    }

    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
