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

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { registerWithCredentials, isAuthenticated, isLoading } = useKeycloak();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerWithCredentials(
        formData.email,
        formData.username || formData.email,
        formData.password,
        formData.firstName || undefined,
        formData.lastName || undefined,
      );
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Registration failed');
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
              {t('auth.register.title')}
            </h1>
            <p className="text-muted-foreground text-base">{t('auth.register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  {t('auth.register.firstName')}
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder={t('auth.register.firstNamePlaceholder')}
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="given-name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  {t('auth.register.lastName')}
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder={t('auth.register.lastNamePlaceholder')}
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('auth.register.email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('auth.register.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                {t('auth.register.username')}{' '}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder={t('auth.register.usernamePlaceholder')}
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.register.password')}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('auth.register.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t('auth.register.confirmPassword')}
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.register.submit')
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.register.signInLink')}{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                {t('nav.signIn')}
              </Link>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">{t('auth.register.backToHome')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
