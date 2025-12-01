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

export default function RegisterPage() {
    const { t } = useLanguage();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('auth.register.errors.firstNameRequired');
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = t('auth.register.errors.lastNameRequired');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('auth.register.errors.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('auth.register.errors.emailInvalid');
        }

        if (!formData.password) {
            newErrors.password = t('auth.register.errors.passwordRequired');
        } else if (formData.password.length < 6) {
            newErrors.password = t('auth.register.errors.passwordMinLength');
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.register.errors.passwordRequired');
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.register.errors.passwordMismatch');
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
            await apiClient.register({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            setIsSuccess(true);
            // Redirect to sign in after 2 seconds
            setTimeout(() => {
                router.push('/auth/signin');
            }, 2000);
        } catch (error: any) {
            const message = error.message || t('auth.register.errors.registrationFailed');
            if (message.includes('already exists') || message.includes('email')) {
                setErrors({ email: t('auth.register.errors.emailExists') });
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
                            {t('auth.register.success')}
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            {t('common.loading')}
                        </p>
                        <Button asChild>
                            <Link href="/auth/signin">
                                {t('nav.signIn')}
                            </Link>
                        </Button>
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
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {errorMessage && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">
                                    {t('auth.register.firstName')}
                                </label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder={t('auth.register.firstNamePlaceholder')}
                                    value={formData.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    className={errors.firstName ? 'border-red-500' : ''}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-600">{errors.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">
                                    {t('auth.register.lastName')}
                                </label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder={t('auth.register.lastNamePlaceholder')}
                                    value={formData.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    className={errors.lastName ? 'border-red-500' : ''}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-600">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                {t('auth.register.email')}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('auth.register.emailPlaceholder')}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                {t('auth.register.password')}
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('auth.register.passwordPlaceholder')}
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                {t('auth.register.confirmPassword')}
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
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
                                <Link href="/">
                                    {t('auth.register.backToHome')}
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
