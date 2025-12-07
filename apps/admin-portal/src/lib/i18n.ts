import enMessages from '../../messages/en.json';
import ruMessages from '../../messages/ru.json';

const messages = {
  en: enMessages,
  ru: ruMessages,
};

// Get locale from localStorage or default to 'en'
export function getLocale(): string {
  if (typeof window === 'undefined') {
    return 'en';
  }
  // Force English as default for admin portal
  const stored = localStorage.getItem('locale');
  return stored === 'ru' ? 'ru' : 'en';
}

// Set locale
export function setLocale(locale: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    window.location.reload();
  }
}

type MessagesType = typeof enMessages;
type NestedValue = MessagesType | string | undefined;

// Get translation function (React hook)
import { useMemo, useState, useEffect } from 'react';

export function useTranslations(namespace?: string) {
  // Use state to track locale changes
  const [locale, setLocaleState] = useState(() =>
    typeof window !== 'undefined' ? getLocale() : 'en'
  );

  // Update locale when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateLocale = () => {
      const currentLocale = getLocale();
      if (currentLocale !== locale) {
        setLocaleState(currentLocale);
      }
    };

    // Check locale on mount and periodically
    updateLocale();
    const interval = setInterval(updateLocale, 100);

    // Listen for storage changes (when locale is changed in another tab)
    window.addEventListener('storage', updateLocale);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateLocale);
    };
  }, [locale]);

  return useMemo(() => {
    const localeMessages = messages[locale as keyof typeof messages] || messages.en;

    return (key: string, params?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const keysArray = fullKey.split('.');

      // Start from the root messages object
      let value: NestedValue = localeMessages;

      // Navigate through the nested object
      for (const k of keysArray) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as any)[k];
        } else {
          value = undefined;
          break;
        }
      }

      // If not found, try fallback to English
      if (value === undefined || typeof value !== 'string') {
        let fallback: NestedValue = messages.en;
        for (const k of keysArray) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = (fallback as any)[k];
          } else {
            fallback = undefined;
            break;
          }
        }

        if (typeof fallback === 'string') {
          value = fallback;
        }
      }

      // If still not found, return the key (for debugging)
      if (typeof value !== 'string') {
        console.warn(`[i18n] Translation not found for key: ${fullKey}, locale: ${locale}`);
        return fullKey;
      }

      // Replace params
      if (params) {
        return Object.entries(params).reduce(
          (str, [param, val]) => str.replace(`{${param}}`, String(val)),
          value,
        );
      }

      return value;
    };
  }, [locale, namespace]);
}
