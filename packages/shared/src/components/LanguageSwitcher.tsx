'use client';

import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface LanguageSwitcherProps {
  /**
   * Function to get current locale
   */
  getLocale: () => string;
  /**
   * Function to set locale
   */
  setLocale: (locale: string) => void;
  /**
   * Optional custom className for the container
   */
  className?: string;
  /**
   * Optional custom className for the select element
   */
  selectClassName?: string;
}

/**
 * Reusable language switcher component
 * Can be used across all portals (Admin, Vendor, Client)
 */
export function LanguageSwitcher({
  getLocale,
  setLocale,
  className = '',
  selectClassName = '',
}: LanguageSwitcherProps) {
  const [locale, setLocaleState] = useState('en');

  useEffect(() => {
    const currentLocale = getLocale();
    setLocaleState(currentLocale);
  }, [getLocale]);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className={`text-sm border border-gray-300 rounded px-2 py-1 bg-white ${selectClassName}`}
        aria-label="Select language"
      >
        <option value="en">EN</option>
        <option value="ru">RU</option>
      </select>
    </div>
  );
}

