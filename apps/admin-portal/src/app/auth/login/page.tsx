'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useTranslations } from '@/lib/i18n';
import { API_BASE_URL } from '@/lib/config';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: 'admin@memento-mori.com',
    password: '',
  });

  // Если уже авторизован, редиректим на dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      console.log('[Login] Check if already authenticated, token exists:', !!token);
      if (token) {
        console.log('[Login] Already authenticated, redirecting to dashboard');
        router.replace('/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('invalidCredentials') }));
        throw new Error(errorData.message || t('invalidCredentials'));
      }

      const data = await response.json();

      // Сохраняем токен
      if (data.token && data.user) {
        console.log('[Login] Saving token:', data.token.substring(0, 20) + '...');
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Проверяем, что токен действительно сохранился
        const savedToken = localStorage.getItem('auth_token');
        console.log('[Login] Token saved:', !!savedToken, 'Length:', savedToken?.length);

        if (!savedToken || savedToken !== data.token) {
          console.error('[Login] Token save failed!');
          throw new Error('Token save failed');
        }

        console.log('[Login] Redirecting to dashboard...');
        // Используем window.location для гарантированного редиректа
        // Это гарантирует, что токен будет доступен при загрузке следующей страницы
        window.location.href = '/dashboard';
        return;
      }

      throw new Error('Token not received from server');
    } catch (err: any) {
      setError(err.message || tErrors('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-sm text-gray-600">{t('enterCredentials')}</p>
          </div>

          {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} variant="error" />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')}
              </label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@memento-mori.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('password')}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loggingIn') : t('loginButton')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>{t('useAdminCredentials')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
