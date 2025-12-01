'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { setCookie } from '@/lib/cookies';

export default function SignInPage() {
    const { t } = useLanguage();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = t('auth.signin.errors.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('auth.signin.errors.emailInvalid');
        }

        if (!formData.password) {
            newErrors.password = t('auth.signin.errors.passwordRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.login({
                email: formData.email.trim(),
                password: formData.password,
            });

            // Save token and user data
            if (response.token) {
                setCookie('authToken', response.token, 7); // 7 days
                if (typeof window !== 'undefined') {
                    localStorage.setItem('authToken', response.token);
                    if (response.user) {
                        localStorage.setItem('user', JSON.stringify(response.user));
                    }
                }
            }

            setIsSuccess(true);
            // Redirect to home after 1 second
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error: any) {
            const message = error.message || t('auth.signin.errors.loginFailed');
            if (message.includes('Invalid') || message.includes('invalid')) {
                setErrors({ 
                    email: t('auth.signin.errors.invalidCredentials'),
                    password: t('auth.signin.errors.invalidCredentials')
                });
            } else {
                setErrorMessage(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    if (isSuccess) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="border-none shadow-lg">
                    <CardContent className="p-6 sm:p-8 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl sm:text-3xl font-bold mb-4 gradient-heading">
                            {t('auth.signin.success')}
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            {t('common.loading')}
                        </p>
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
                        <p className="text-muted-foreground text-base">
                            {t('auth.signin.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {errorMessage && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{errorMessage}</span>
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
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={errors.email ? 'border-red-500' : ''}
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                {t('auth.signin.password')}
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('auth.signin.passwordPlaceholder')}
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className={errors.password ? 'border-red-500' : ''}
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                                <Link href="/">
                                    {t('auth.signin.backToHome')}
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
