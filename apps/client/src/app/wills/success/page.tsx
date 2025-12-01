'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react';

export default function SuccessPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [appointmentId, setAppointmentId] = useState<string | null>(null);

    useEffect(() => {
        const savedAppointmentId = localStorage.getItem('lastAppointmentId');
        if (!savedAppointmentId) {
            // If no appointment ID, redirect to home
            router.push('/');
            return;
        }
        setAppointmentId(savedAppointmentId);
    }, [router]);

    if (!appointmentId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12 text-muted-foreground">
                    {t('common.loading')}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-heading">
                    {t('wills.success.title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('wills.success.subtitle')}
                </p>
            </div>

            <Card className="border-none shadow-lg mb-6">
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {t('wills.success.appointmentNumber')}
                            </p>
                            <p className="text-2xl font-bold font-mono">
                                #{appointmentId.substring(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-lg mb-6">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {t('wills.success.nextSteps.title')}
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold text-primary">1</span>
                            </div>
                            <span>{t('wills.success.nextSteps.step1')}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold text-primary">2</span>
                            </div>
                            <span>{t('wills.success.nextSteps.step2')}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold text-primary">3</span>
                            </div>
                            <span>{t('wills.success.nextSteps.step3')}</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                >
                    <Link href="/">
                        {t('wills.success.backToHome')}
                    </Link>
                </Button>
                <Button
                    asChild
                    className="flex-1"
                >
                    <Link href="/wills/my-appointments">
                        {t('wills.success.myAppointments')} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}



