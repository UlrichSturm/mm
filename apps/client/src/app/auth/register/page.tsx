'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useKeycloak } from '@/components/auth/KeycloakProvider';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useKeycloak();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleRegister = () => {
    register();
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
            <p className="text-muted-foreground text-base">
              {t('auth.register.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={handleRegister} className="w-full" size="lg">
              {t('auth.register.submit')}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.register.signInLink')}{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                {t('nav.signIn')}
              </Link>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                {t('auth.register.backToHome')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
