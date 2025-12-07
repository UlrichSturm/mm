'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initKeycloak, keycloak, getUserInfo } from '@/lib/keycloak';

interface KeycloakContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof getUserInfo> | null;
  login: () => void;
  logout: () => void;
  refreshAuth: () => void;
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
    initKeycloak(
      () => {
        setIsAuthenticatedState(true);
        setUser(getUserInfo());
        setIsLoading(false);
      },
      error => {
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

  const refreshAuth = () => {
    // Force refresh authentication state
    if (keycloak.authenticated) {
      setIsAuthenticatedState(true);
      setUser(getUserInfo());
    } else {
      setIsAuthenticatedState(false);
      setUser(null);
    }
  };

  return (
    <KeycloakContext.Provider
      value={{
        isAuthenticated: isAuthenticatedState,
        isLoading,
        user,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}
