/**
 * Keycloak configuration and initialization for Client App
 */

import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'memento-mori',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'memento-mori-client',
};

export const keycloak = new Keycloak(keycloakConfig);

/**
 * Initialize Keycloak
 * @param onAuthenticatedCallback - Called when user is authenticated
 * @param onErrorCallback - Called on initialization error
 */
export async function initKeycloak(
  onAuthenticatedCallback?: () => void,
  onErrorCallback?: (error: Error) => void,
): Promise<boolean> {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso', // Check SSO silently
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256', // Use PKCE for security
      checkLoginIframe: false, // Disable iframe check for better performance
    });

    if (authenticated) {
      // Save token
      if (keycloak.token) {
        localStorage.setItem('authToken', keycloak.token);
      }

      // Setup token refresh
      setupTokenRefresh();

      onAuthenticatedCallback?.();
    }

    return authenticated;
  } catch (error) {
    console.error('Keycloak initialization error:', error);
    onErrorCallback?.(error as Error);
    return false;
  }
}

/**
 * Setup automatic token refresh
 */
function setupTokenRefresh() {
  // Refresh token before it expires (30 seconds before)
  keycloak.onTokenExpired = () => {
    keycloak
      .updateToken(30)
      .then((refreshed) => {
        if (refreshed && keycloak.token) {
          localStorage.setItem('authToken', keycloak.token);
          console.log('Token refreshed');
        }
      })
      .catch(() => {
        // Token refresh failed, redirect to login
        console.error('Token refresh failed');
        login();
      });
  };
}

/**
 * Login - redirects to Keycloak login page
 */
export function login(redirectUri?: string): void {
  keycloak.login({
    redirectUri: redirectUri || window.location.origin + '/',
  });
}

/**
 * Logout - redirects to Keycloak logout page
 */
export function logout(redirectUri?: string): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  keycloak.logout({
    redirectUri: redirectUri || window.location.origin + '/',
  });
}

/**
 * Register - redirects to Keycloak registration page
 */
export function register(redirectUri?: string): void {
  keycloak.register({
    redirectUri: redirectUri || window.location.origin + '/',
  });
}

/**
 * Get current access token
 */
export function getToken(): string | null {
  return keycloak.token || localStorage.getItem('authToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return keycloak.authenticated || false;
}

/**
 * Get user info from token
 */
export function getUserInfo() {
  if (!keycloak.tokenParsed) {
    return null;
  }

  return {
    id: keycloak.tokenParsed.sub,
    email: keycloak.tokenParsed.email || keycloak.tokenParsed.preferred_username,
    firstName: keycloak.tokenParsed.given_name,
    lastName: keycloak.tokenParsed.family_name,
    roles: keycloak.tokenParsed.realm_access?.roles || [],
  };
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: string): boolean {
  if (!keycloak.tokenParsed) {
    return false;
  }
  const roles = keycloak.tokenParsed.realm_access?.roles || [];
  return roles.includes(role);
}

/**
 * Get user roles
 */
export function getUserRoles(): string[] {
  if (!keycloak.tokenParsed) {
    return [];
  }
  return keycloak.tokenParsed.realm_access?.roles || [];
}

