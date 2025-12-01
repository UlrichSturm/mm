'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export type ErrorDisplayVariant = 'error' | 'warning' | 'info';

interface ErrorDisplayProps {
  error: string | Error | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: ErrorDisplayVariant;
  autoDismiss?: number; // Автоматически скрыть через N секунд
  showRetry?: boolean;
}

const variantStyles: Record<ErrorDisplayVariant, { bg: string; border: string; text: string; icon: string }> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
  },
};

export function ErrorDisplay({
  error,
  onDismiss,
  onRetry,
  className,
  variant = 'error',
  autoDismiss,
  showRetry = false,
}: ErrorDisplayProps) {
  const [isVisible, setIsVisible] = useState(!!error);

  useEffect(() => {
    setIsVisible(!!error);
  }, [error]);

  useEffect(() => {
    if (autoDismiss && error && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismiss * 1000);
      return () => clearTimeout(timer);
    }
  }, [error, autoDismiss, isVisible, onDismiss]);

  if (!error || !isVisible) return null;

  const errorMessage = error instanceof Error ? error.message : error;
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative rounded-md border p-4 animate-in slide-in-from-top-2',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex items-start">
        <AlertCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
        <div className="ml-3 flex-1">
          <h3 className={cn('text-sm font-medium', styles.text)}>
            {variant === 'error' ? 'Error' : variant === 'warning' ? 'Warning' : 'Information'}
          </h3>
          <p className={cn('mt-1 text-sm', styles.text.replace('800', '700'))}>
            {errorMessage}
          </p>
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Retry
            </Button>
          )}
        </div>
        <div className="ml-4 flex items-center gap-2">
          {onRetry && !showRetry && (
            <button
              onClick={onRetry}
              className={cn('flex-shrink-0 hover:opacity-80', styles.icon)}
              title="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              className={cn('flex-shrink-0 hover:opacity-80', styles.icon)}
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

