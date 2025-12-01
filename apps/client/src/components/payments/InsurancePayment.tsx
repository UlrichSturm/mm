'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { Calendar, DollarSign } from 'lucide-react';

interface InsurancePaymentProps {
    policyId: string;
}

interface Payment {
    id: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paidDate?: string;
}

export function InsurancePayment({ policyId }: InsurancePaymentProps) {
    const { t } = useLanguage();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadPayments();
    }, [policyId]);

    const loadPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.getInsurancePayments(policyId);
            setPayments(data);
        } catch (err) {
            console.error('Failed to load payments:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (paymentId: string) => {
        setProcessing(paymentId);
        try {
            // TODO: Integrate with payment gateway
            // For now, just simulate payment
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // Reload payments
            await loadPayments();
        } catch (err) {
            console.error('Failed to process payment:', err);
            alert(t('payments.insurance.paymentError'));
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {t('common.loading')}
            </div>
        );
    }

    if (error) {
        return (
            <ErrorDisplay
                error={error}
                onRetry={loadPayments}
                title={t('payments.insurance.loadError')}
            />
        );
    }

    const pendingPayments = payments.filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE');
    const paidPayments = payments.filter((p) => p.status === 'PAID');

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">
                {t('payments.insurance.title')}
            </h3>

            {pendingPayments.length > 0 && (
                <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">
                            {t('payments.insurance.pendingPayments')}
                        </h4>
                        <div className="space-y-4">
                            {pendingPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 border rounded-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">
                                                ${payment.amount.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {t('payments.insurance.dueDate')}:{' '}
                                                    {new Date(payment.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handlePay(payment.id)}
                                        disabled={processing === payment.id}
                                        variant={payment.status === 'OVERDUE' ? 'default' : 'outline'}
                                    >
                                        {processing === payment.id
                                            ? t('common.loading')
                                            : t('payments.insurance.pay')}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {paidPayments.length > 0 && (
                <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">
                            {t('payments.insurance.paymentHistory')}
                        </h4>
                        <div className="space-y-2">
                            {paidPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-3 border rounded-md"
                                >
                                    <div>
                                        <p className="font-medium">
                                            ${payment.amount.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        {payment.paidDate && (
                                            <p className="text-sm text-muted-foreground">
                                                {t('payments.insurance.paidDate')}:{' '}
                                                {new Date(payment.paidDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-sm text-green-600 font-medium">
                                        {t('payments.insurance.paid')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {payments.length === 0 && (
                <Card className="border-none shadow-lg">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        {t('payments.insurance.noPayments')}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}



