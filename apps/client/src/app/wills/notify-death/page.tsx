'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { DeathNotificationForm } from '@/components/wills/DeathNotificationForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NotifyDeathPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: {
        clientName?: string;
        appointmentNumber?: string;
        deathDate: string;
        deathCertificate?: File;
        notifierContact: string;
    }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await apiClient.notifyDeath(data);
            setSuccess(true);
            
            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err) {
            console.error('Failed to notify death:', err);
            setError(t('wills.deathNotification.submitError'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="border-green-500 bg-green-50">
                    <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-green-800">
                            {t('wills.deathNotification.success.title')}
                        </h2>
                        <p className="text-green-700 mb-4">
                            {t('wills.deathNotification.success.message')}
                        </p>
                        <p className="text-sm text-green-600">
                            {t('wills.deathNotification.success.redirect')}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-heading">
                {t('wills.deathNotification.title')}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
                {t('wills.deathNotification.subtitle')}
            </p>

            {error && (
                <Card className="border-red-500 bg-red-50 mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <DeathNotificationForm
                onSubmit={handleSubmit}
                loading={loading}
            />
        </div>
    );
}



