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

// Track initialization state to prevent multiple initializations
let isInitializing = false;
let isInitialized = false;

export async function initKeycloak(
  onAuthenticatedCallback?: () => void,
  onErrorCallback?: (error: Error) => void,
): Promise<boolean> {
  // Prevent multiple initializations
  if (isInitialized) {
    return keycloak.authenticated || false;
  }

  if (isInitializing) {
    // Wait for ongoing initialization
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isInitializing) {
          clearInterval(checkInterval);
          resolve(keycloak.authenticated || false);
        }
      }, 100);
    });
  }

  isInitializing = true;

  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    isInitialized = true;
    isInitializing = false;

    if (authenticated) {
      if (keycloak.token) {
        localStorage.setItem('authToken', keycloak.token);
      }
      setupTokenRefresh();
      onAuthenticatedCallback?.();
    }

    return authenticated;
  } catch (error) {
    isInitializing = false;
    isInitialized = true; // Mark as initialized even on error to prevent retry loops
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

/**
 * Direct login with username and password (Resource Owner Password Credentials Grant)
 * Works with public clients (no client_secret required)
 */
export async function loginWithCredentials(
  username: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', keycloakConfig.clientId);
    params.append('username', username);
    params.append('password', password);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error_description || errorData.error || 'Invalid credentials';

      // Translate common Keycloak errors
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('Invalid user credentials')) {
        userFriendlyError = 'Invalid email or password';
      } else if (errorMessage.includes('Account is disabled')) {
        userFriendlyError = 'Account is disabled';
      } else if (errorMessage.includes('Account is temporarily disabled')) {
        userFriendlyError = 'Account is temporarily disabled due to too many failed login attempts';
      }

      return {
        success: false,
        error: userFriendlyError,
      };
    }

    const data = await response.json();

    // Update keycloak instance with the token
    keycloak.token = data.access_token;
    keycloak.refreshToken = data.refresh_token;
    keycloak.idToken = data.id_token;
    keycloak.authenticated = true;

    // Parse token to get user info
    if (data.access_token) {
      try {
        const tokenParts = data.access_token.split('.');
        if (tokenParts.length === 3) {
          // Decode base64url
          const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
          keycloak.tokenParsed = JSON.parse(atob(padded));
        }
      } catch (parseError) {
        console.error('Error parsing token:', parseError);
      }
    }

    // Store token in localStorage
    if (keycloak.token) {
      localStorage.setItem('authToken', keycloak.token);
    }

    // Setup token refresh
    setupTokenRefresh();

    // Trigger auth success event
    if (keycloak.onAuthSuccess) {
      keycloak.onAuthSuccess();
    }

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed. Please try again.',
    };
  }
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

