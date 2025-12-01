'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { LawyerCard } from '@/components/wills/LawyerCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { Search, Filter } from 'lucide-react';
import { getCookie } from '@/lib/cookies';

interface Lawyer {
    id: string;
    name: string;
    rating?: number;
    licenseType: 'lawyer' | 'notary' | 'both';
    postalCode: string;
    address: string;
    homeVisitAvailable: boolean;
    specialization?: string;
    maxTravelRadius?: number;
}

export default function SelectLawyerPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [licenseFilter, setLicenseFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'rating' | 'distance'>('rating');
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Check for postal code immediately on mount - before loading lawyers
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check cookies first, then localStorage for backward compatibility
            const postalCode = getCookie('userPostalCode') || localStorage.getItem('userPostalCode');
            if (!postalCode) {
                // Use window.location for immediate redirect
                setIsRedirecting(true);
                window.location.href = '/wills/postal-code';
                return;
            }
            // Only load lawyers if postal code exists
            loadLawyers();
        }
    }, []);

    const loadLawyers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check cookies first, then localStorage for backward compatibility
            const postalCode = getCookie('userPostalCode') || localStorage.getItem('userPostalCode');
            // This check is redundant now, but kept as a safety measure
            if (!postalCode) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/wills/postal-code';
                }
                return;
            }

            const data = await apiClient.getAvailableLawyers(postalCode);
            // Handle both array and object responses
            if (Array.isArray(data)) {
                setLawyers(data);
            } else if (data && Array.isArray(data.lawyers)) {
                setLawyers(data.lawyers);
            } else if (data && Array.isArray(data.data)) {
                setLawyers(data.data);
            } else {
                // If API returns empty or unexpected format, set empty array
                setLawyers([]);
            }
        } catch (err) {
            console.error('Failed to load lawyers:', err);
            // Don't show error if it's just 404 - API might not be ready yet
            if (err instanceof Error && err.message.includes('404')) {
                setLawyers([]); // Set empty array instead of error
            } else {
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLawyer = (lawyerId: string) => {
        localStorage.setItem('selectedLawyerId', lawyerId);
        router.push('/wills/select-location');
    };

    const filteredAndSortedLawyers = lawyers
        .filter((lawyer) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (
                    !lawyer.name.toLowerCase().includes(query) &&
                    !lawyer.address.toLowerCase().includes(query) &&
                    !lawyer.specialization?.toLowerCase().includes(query)
                ) {
                    return false;
                }
            }

            // License type filter
            if (licenseFilter !== 'all') {
                if (licenseFilter === 'lawyer' && lawyer.licenseType !== 'lawyer' && lawyer.licenseType !== 'both') {
                    return false;
                }
                if (licenseFilter === 'notary' && lawyer.licenseType !== 'notary' && lawyer.licenseType !== 'both') {
                    return false;
                }
                if (licenseFilter === 'both' && lawyer.licenseType !== 'both') {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') {
                return (b.rating || 0) - (a.rating || 0);
            }
            // For distance, we'd need distance data from API
            return 0;
        });

    // Don't render anything if redirecting
    if (isRedirecting) {
        return null;
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12 text-muted-foreground">
                    {t('common.loading')}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorDisplay
                    error={error}
                    onRetry={loadLawyers}
                    title={t('wills.lawyer.loadError')}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-heading">
                {t('wills.lawyer.title')}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
                {t('wills.lawyer.subtitle')}
            </p>

            {/* Filters */}
            <Card className="mb-6 border-none shadow-lg">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={t('wills.lawyer.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder={t('wills.lawyer.filterLicense')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('wills.lawyer.filterAll')}</SelectItem>
                                    <SelectItem value="lawyer">{t('wills.lawyer.licenseType.lawyer')}</SelectItem>
                                    <SelectItem value="notary">{t('wills.lawyer.licenseType.notary')}</SelectItem>
                                    <SelectItem value="both">{t('wills.lawyer.licenseType.both')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-48">
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'rating' | 'distance')}>
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rating">{t('wills.lawyer.sortByRating')}</SelectItem>
                                    <SelectItem value="distance">{t('wills.lawyer.sortByDistance')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lawyers List */}
            {filteredAndSortedLawyers.length === 0 ? (
                <Card className="border-none shadow-lg">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">{t('wills.lawyer.noLawyers')}</p>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/wills/postal-code')}
                            className="mt-4"
                        >
                            {t('wills.lawyer.changePostalCode')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAndSortedLawyers.map((lawyer) => (
                        <LawyerCard
                            key={lawyer.id}
                            lawyer={lawyer}
                            onSelect={handleSelectLawyer}
                        />
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-center">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                >
                    {t('common.back')}
                </Button>
            </div>
        </div>
    );
}

