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

// Get translation function
export function useTranslations(namespace?: string) {
  const locale = getLocale();
  const localeMessages = messages[locale as keyof typeof messages] || messages.en;

  return (key: string, params?: Record<string, string | number>) => {
    const keys = namespace ? `${namespace}.${key}` : key;
    const keysArray = keys.split('.');
    let value: NestedValue = localeMessages;

    for (const k of keysArray) {
      value = (value as Record<string, NestedValue>)?.[k];
      if (value === undefined) {
        // Fallback to English
        let fallback: NestedValue = messages.en;
        for (const k2 of keysArray) {
          fallback = (fallback as Record<string, NestedValue>)?.[k2];
        }
        value = fallback;
        break;
      }
    }

    if (typeof value !== 'string') {
      return keys; // Return key if translation not found
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
}
