'use client';

import { useState, useEffect } from 'react';
import { MapPin, Edit2 } from 'lucide-react';
import { getCookie, setCookie } from '@/lib/cookies';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export function PostalCodeDisplay() {
  const { t } = useLanguage();
  const [postalCode, setPostalCode] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    // Load postal code from cookie
    const loadPostalCode = () => {
      // Don't update if user is currently editing
      if (isEditing) {
        return;
      }

      const code = getCookie('userPostalCode') || localStorage.getItem('userPostalCode');
      setPostalCode(code);
      // Only update editValue if not editing
      if (!isEditing) {
        setEditValue(code || '');
      }
    };

    loadPostalCode();

    // Listen for storage changes (when postal code is updated on other tabs/pages)
    const handleStorageChange = () => {
      if (!isEditing) {
        loadPostalCode();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case cookie was updated (cookies don't trigger storage event)
    // But only if not editing
    const interval = setInterval(() => {
      if (!isEditing) {
        loadPostalCode();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(postalCode || '');
  };

  const handleSave = () => {
    if (!isEditing) {
      return;
    } // Prevent saving if not in edit mode

    const trimmedValue = editValue.trim();
    if (trimmedValue && /^\d{5,6}$/.test(trimmedValue)) {
      setCookie('userPostalCode', trimmedValue);
      // Also update localStorage for backward compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPostalCode', trimmedValue);
        // Trigger storage event so other components can update
        window.dispatchEvent(new Event('storage'));
      }
      setPostalCode(trimmedValue);
      setIsEditing(false);
    } else {
      // Invalid postal code - reset
      setEditValue(postalCode || '');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(postalCode || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Use setTimeout to allow click events to process first
    // This prevents immediate save when clicking outside
    setTimeout(() => {
      // Check if focus moved to another element in our component
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!relatedTarget || !e.currentTarget.parentElement?.contains(relatedTarget)) {
        handleSave();
      }
    }, 200);
  };

  if (!postalCode && !isEditing) {
    return null; // Don't show if no postal code is set
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-20 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="01277"
            maxLength={6}
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md',
            'text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'border border-border/50',
          )}
          title={t('wills.postalCode.clickToEdit') || 'Click to change postal code'}
        >
          <MapPin className="w-4 h-4 text-primary" />
          <span>{postalCode}</span>
          <Edit2 className="w-3 h-3 opacity-60" />
        </button>
      )}
    </div>
  );
}
