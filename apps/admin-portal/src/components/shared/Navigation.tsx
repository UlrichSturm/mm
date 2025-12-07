'use client';

import Link from 'next/link';
import { Users, LayoutDashboard, Calendar, CheckCircle, TrendingUp, Store } from 'lucide-react';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { useTranslations, getLocale, setLocale } from '@/lib/i18n';
import { useKeycloak } from '@/components/auth/KeycloakProvider';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export function Navigation() {
  const t = useTranslations('nav');
  const { isAuthenticated, isLoading } = useKeycloak();

  // Don't show navigation if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                {t('dashboard')}
              </Link>
              <Link
                href="/lawyer-notary"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                <Users className="w-4 h-4 mr-2" />
                {t('lawyers')}
              </Link>
              <Link
                href="/vendors"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                <Store className="w-4 h-4 mr-2" />
                {t('vendors')}
              </Link>
              <Link
                href="/lawyer-notary/statistics"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('statistics')}
              </Link>
              <Link
                href="/wills/appointments"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('appointments')}
              </Link>
              <Link
                href="/wills/executions"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('executions')}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher
              getLocale={getLocale}
              setLocale={setLocale}
            />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

