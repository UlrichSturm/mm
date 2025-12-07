'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { useTranslations } from '@/lib/i18n';

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">{t('loading')}</div>
    </div>
  );
}

