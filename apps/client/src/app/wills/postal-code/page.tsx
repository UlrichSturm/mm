'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { MapPin, Loader2 } from 'lucide-react';
import { getCookie, setCookie } from '@/lib/cookies';

// Simple mapping for common postal codes (fallback if API is not available)
const postalCodeToCity: Record<string, string> = {
    '01277': 'Dresden',
    '10115': 'Berlin',
    '20095': 'Hamburg',
    '80331': 'München',
    '50667': 'Köln',
    '60311': 'Frankfurt',
    '70173': 'Stuttgart',
};

export default function PostalCodePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [postalCode, setPostalCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState<string | null>(null);
    const [loadingCity, setLoadingCity] = useState(false);

    // Check if postal code already exists in cookies or localStorage
    useEffect(() => {
        const savedPostalCode = getCookie('userPostalCode') || localStorage.getItem('userPostalCode');
        if (savedPostalCode) {
            // Migrate from localStorage to cookies if needed
            if (!getCookie('userPostalCode') && localStorage.getItem('userPostalCode')) {
                setCookie('userPostalCode', savedPostalCode);
            }
            router.push('/wills/select-lawyer');
        }
    }, [router]);

    const validatePostalCode = (code: string): boolean => {
        // Basic validation - adjust based on your country's postal code format
        // Example: 5 digits for US, 6 digits for some countries
        // Allow leading zeros
        const postalCodeRegex = /^\d{5,6}$/;
        return postalCodeRegex.test(code);
    };

    // Fetch city by postal code with debounce
    const fetchCity = useCallback(async (code: string) => {
        const trimmedCode = code.trim();
        
        if (!trimmedCode || trimmedCode.length < 5) {
            setCity(null);
            return;
        }

        if (!validatePostalCode(trimmedCode)) {
            setCity(null);
            return;
        }

        setLoadingCity(true);
        try {
            // Try API first
            const cityFromApi = await apiClient.getCityByPostalCode(trimmedCode);
            
            if (cityFromApi) {
                setCity(cityFromApi);
            } else {
                // Fallback to local mapping
                const cityFromMapping = postalCodeToCity[trimmedCode];
                setCity(cityFromMapping || null);
            }
        } catch (error) {
            // Fallback to local mapping
            const cityFromMapping = postalCodeToCity[trimmedCode];
            setCity(cityFromMapping || null);
        } finally {
            setLoadingCity(false);
        }
    }, []);

    // Debounced city lookup
    useEffect(() => {
        const timer = setTimeout(() => {
            if (postalCode) {
                fetchCity(postalCode);
            } else {
                setCity(null);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [postalCode, fetchCity]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);

        const trimmedPostalCode = postalCode.trim();
        
        if (!trimmedPostalCode) {
            setError(t('wills.postalCode.required'));
            return;
        }

        if (!validatePostalCode(trimmedPostalCode)) {
            setError(t('wills.postalCode.invalid'));
            return;
        }

        setLoading(true);
        try {
            // Save to cookies (primary storage)
            setCookie('userPostalCode', trimmedPostalCode);
            // Also save to localStorage for backward compatibility
            localStorage.setItem('userPostalCode', trimmedPostalCode);

            // TODO: Update user profile via API when authentication is ready
            // await apiClient.updateUserProfile({ postalCode });

            // Redirect to next step
            router.push('/wills/select-lawyer');
        } catch (err) {
            console.error('Failed to save postal code:', err);
            setError(t('wills.postalCode.saveError'));
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card className="border-none shadow-lg">
                <CardContent className="p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-heading">
                        {t('wills.postalCode.title')}
                    </h1>
                    <p className="text-muted-foreground text-center mb-6">
                        {t('wills.postalCode.subtitle')}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('wills.postalCode.label')}
                            </label>
                            <Input
                                type="text"
                                placeholder={t('wills.postalCode.placeholder')}
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="h-12"
                                maxLength={6}
                            />
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                            {postalCode && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    {loadingCity ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {t('wills.postalCode.lookingUpCity')}
                                            </span>
                                        </>
                                    ) : city ? (
                                        <>
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="text-muted-foreground">
                                                {t('wills.postalCode.city')}: <span className="font-medium text-foreground">{city}</span>
                                            </span>
                                        </>
                                    ) : postalCode.length >= 5 && validatePostalCode(postalCode.trim()) ? (
                                        <span className="text-muted-foreground text-xs">
                                            {t('wills.postalCode.cityNotFound')}
                                        </span>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                {t('common.back')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? t('common.loading') : t('common.continue')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

