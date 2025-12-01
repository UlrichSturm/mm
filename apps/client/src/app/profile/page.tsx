'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated()) {
            router.push('/auth/signin');
            return;
        }

        // Load user data
        const user = getUser();
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
            });
        }

        // Try to fetch fresh profile data from API
        const loadProfile = async () => {
            try {
                const profile = await apiClient.getProfile();
                setFormData({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    email: profile.email || '',
                });
            } catch (error) {
                // If API fails, use localStorage data
                console.error('Failed to load profile from API:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [router]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('profile.errors.firstNameRequired');
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = t('profile.errors.lastNameRequired');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('profile.errors.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('profile.errors.emailInvalid');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const updated = await apiClient.updateProfile({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
            });

            // Update localStorage with new user data
            if (typeof window !== 'undefined') {
                const currentUser = getUser();
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        firstName: updated.firstName || formData.firstName.trim(),
                        lastName: updated.lastName || formData.lastName.trim(),
                        email: updated.email || formData.email.trim(),
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    // Trigger storage event to update Header
                    window.dispatchEvent(new Event('storage'));
                }
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            const message = error.message || t('profile.errors.updateFailed');
            setErrorMessage(message);
        } finally {
            setSaving(false);
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
        if (success) {
            setSuccess(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">{t('profile.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.back')}
                    </Link>
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-6 md:p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold gradient-heading mb-2">
                            {t('profile.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('profile.subtitle')}
                        </p>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                            <p className="text-green-800 dark:text-green-200">
                                {t('profile.success')}
                            </p>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-red-800 dark:text-red-200">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium">
                                {t('profile.firstName')}
                            </label>
                            <Input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                placeholder={t('profile.firstNamePlaceholder')}
                                className={errors.firstName ? 'border-red-500' : ''}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500">{errors.firstName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">
                                {t('profile.lastName')}
                            </label>
                            <Input
                                id="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                placeholder={t('profile.lastNamePlaceholder')}
                                className={errors.lastName ? 'border-red-500' : ''}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-500">{errors.lastName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                {t('profile.email')}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder={t('profile.emailPlaceholder')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        {t('common.loading')}
                                    </>
                                ) : (
                                    t('profile.save')
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={saving}
                            >
                                {t('profile.cancel')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

