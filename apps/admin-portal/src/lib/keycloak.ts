/**
 * Keycloak configuration and initialization for Admin Portal
 */

import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'memento-mori',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'memento-mori-admin',
};

export const keycloak = new Keycloak(keycloakConfig);

export async function initKeycloak(
  onAuthenticatedCallback?: () => void,
  onErrorCallback?: (error: Error) => void,
): Promise<boolean> {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    if (authenticated) {
      if (keycloak.token) {
        localStorage.setItem('authToken', keycloak.token);
      }
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

function setupTokenRefresh() {
  keycloak.onTokenExpired = () => {
    keycloak
      .updateToken(30)
      .then((refreshed) => {
        if (refreshed && keycloak.token) {
          localStorage.setItem('authToken', keycloak.token);
        }
      })
      .catch(() => {
        login();
      });
  };
}

export function login(redirectUri?: string): void {
  keycloak.login({
    redirectUri: redirectUri || window.location.origin + '/',
  });
}

export function logout(redirectUri?: string): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  keycloak.logout({
    redirectUri: redirectUri || window.location.origin + '/',
  });
}

export function register(redirectUri?: string): void {
  keycloak.register({
    redirectUri: redirectUri || window.location.origin + '/',
  });
}

export function getToken(): string | null {
  return keycloak.token || localStorage.getItem('authToken');
}

export function isAuthenticated(): boolean {
  return keycloak.authenticated || false;
}

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

export function hasRole(role: string): boolean {
  if (!keycloak.tokenParsed) {
    return false;
  }
  const roles = keycloak.tokenParsed.realm_access?.roles || [];
  return roles.includes(role);
}

export function getUserRoles(): string[] {
  if (!keycloak.tokenParsed) {
    return [];
  }
  return keycloak.tokenParsed.realm_access?.roles || [];
}

