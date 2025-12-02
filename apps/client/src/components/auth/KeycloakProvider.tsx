'use client';

/**
 * Keycloak Provider Component
 * Initializes Keycloak and provides auth state to the app
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  initKeycloak,
  keycloak,
  getUserInfo,
  loginWithCredentials,
  registerWithCredentials,
} from '@/lib/keycloak';

interface KeycloakContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof getUserInfo> | null;
  login: () => void;
  logout: () => void;
  register: () => void;
  loginWithCredentials: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  registerWithCredentials: (
    email: string,
    username: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within KeycloakProvider');
  }
  return context;
}

interface KeycloakProviderProps {
  children: ReactNode;
}

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ReturnType<typeof getUserInfo> | null>(null);

  useEffect(() => {
    // Initialize Keycloak
    initKeycloak(
      () => {
        // On authenticated
        setIsAuthenticatedState(true);
        setUser(getUserInfo());
        setIsLoading(false);
      },
      error => {
        // On error
        console.error('Keycloak initialization error:', error);
        setIsAuthenticatedState(false);
        setUser(null);
        setIsLoading(false);
      },
    ).then(authenticated => {
      if (!authenticated) {
        setIsLoading(false);
      }
    });

    // Listen for token updates
    keycloak.onAuthSuccess = () => {
      setIsAuthenticatedState(true);
      setUser(getUserInfo());
      if (keycloak.token) {
        localStorage.setItem('authToken', keycloak.token);
      }
    };

    keycloak.onAuthError = () => {
      setIsAuthenticatedState(false);
      setUser(null);
    };

    keycloak.onAuthLogout = () => {
      setIsAuthenticatedState(false);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    };
  }, []);

  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin + '/',
    });
  };

  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin + '/',
    });
  };

  const register = () => {
    keycloak.register({
      redirectUri: window.location.origin + '/',
    });
  };

  const handleLoginWithCredentials = async (username: string, password: string) => {
    const result = await loginWithCredentials(username, password);
    if (result.success) {
      setIsAuthenticatedState(true);
      setUser(getUserInfo());
    }
    return result;
  };

  const handleRegisterWithCredentials = async (
    email: string,
    username: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    const result = await registerWithCredentials(email, username, password, firstName, lastName);
    if (result.success) {
      setIsAuthenticatedState(true);
      setUser(getUserInfo());
    }
    return result;
  };

  return (
    <KeycloakContext.Provider
      value={{
        isAuthenticated: isAuthenticatedState,
        isLoading,
        user,
        login,
        logout,
        register,
        loginWithCredentials: handleLoginWithCredentials,
        registerWithCredentials: handleRegisterWithCredentials,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}
