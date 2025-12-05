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

// Track initialization state
let isInitialized = false;
let initPromise: Promise<boolean> | null = null;

/**
 * Initialize Keycloak
 * @param onAuthenticatedCallback - Called when user is authenticated
 * @param onErrorCallback - Called on initialization error
 */
export async function initKeycloak(
  onAuthenticatedCallback?: () => void,
  onErrorCallback?: (error: Error) => void,
): Promise<boolean> {
  // If already initialized, return current state
  if (isInitialized) {
    return keycloak.authenticated || false;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const authenticated = await keycloak.init({
        onLoad: 'check-sso', // Check SSO silently
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256', // Use PKCE for security
        checkLoginIframe: false, // Disable iframe check for better performance
        token: token || undefined,
        refreshToken: refreshToken || undefined,
      });

      isInitialized = true;

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
      isInitialized = false;
      initPromise = null;
      return false;
    }
  })();

  return initPromise;
}

/**
 * Setup automatic token refresh
 */
function setupTokenRefresh() {
  // Refresh token before it expires (30 seconds before)
  keycloak.onTokenExpired = () => {
    keycloak
      .updateToken(30)
      .then(refreshed => {
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

/**
 * Login with credentials using backend API (which uses Keycloak Direct Access Grants with confidential client)
 * This allows login without redirecting to Keycloak login page
 */
export async function loginWithCredentials(
  username: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || 'Invalid credentials',
      };
    }

    const data = await response.json();

    // Update Keycloak instance with tokens
    keycloak.token = data.access_token;
    keycloak.refreshToken = data.refresh_token;
    keycloak.authenticated = true;

    // Parse token
    if (data.access_token) {
      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      keycloak.tokenParsed = JSON.parse(jsonPayload);
    }

    // Save token
    localStorage.setItem('authToken', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refreshToken', data.refresh_token);
    }

    // Setup token refresh
    setupTokenRefresh();

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

/**
 * Register new user using backend API (which uses Keycloak Admin API)
 */
export async function registerWithCredentials(
  email: string,
  username: string,
  password: string,
  firstName?: string,
  lastName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use backend API to create user via Keycloak Admin API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username: username || email,
          password,
          firstName,
          lastName,
        }),
      },
    );

    if (!backendResponse.ok) {
      const backendError = await backendResponse.json().catch(() => ({}));
      return {
        success: false,
        error: backendError.message || backendError.error || 'Registration failed',
      };
    }

    // After successful registration, automatically login
    return await loginWithCredentials(username || email, password);
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}
