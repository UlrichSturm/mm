'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useKeycloak } from '@/components/auth/KeycloakProvider';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { loginWithCredentials, isAuthenticated, isLoading } = useKeycloak();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginWithCredentials(email, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6 sm:p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-heading mb-2">
              {t('auth.signin.title')}
            </h1>
            <p className="text-muted-foreground text-base">{t('auth.signin.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('auth.signin.email')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.signin.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.signin.password')}
              </label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.signin.passwordPlaceholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signin.submit')
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.signin.registerLink')}{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                {t('nav.register')}
              </Link>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">{t('auth.signin.backToHome')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
