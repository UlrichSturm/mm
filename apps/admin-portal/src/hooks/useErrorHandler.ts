'use client';

import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/api/errorHandler';

export interface ErrorHandler {
  error: string | Error | null;
  setError: (error: string | Error | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

export function useErrorHandler(): ErrorHandler {
  const [error, setError] = useState<string | Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    const message = getErrorMessage(err);
    setError(message);
  }, []);

  return {
    error,
    setError,
    clearError,
    handleError,
  };
}

