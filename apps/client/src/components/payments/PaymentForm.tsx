'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
    amount: number;
    onSubmit: (paymentData: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        cardholderName: string;
    }) => Promise<void>;
    loading?: boolean;
}

export function PaymentForm({ amount, onSubmit, loading }: PaymentFormProps) {
    const { t } = useLanguage();
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        setExpiryDate(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (cardNumber.replace(/\s/g, '').length < 16) {
            setError(t('payments.errors.invalidCardNumber'));
            return;
        }

        if (expiryDate.length !== 5) {
            setError(t('payments.errors.invalidExpiryDate'));
            return;
        }

        if (cvv.length < 3) {
            setError(t('payments.errors.invalidCvv'));
            return;
        }

        if (!cardholderName.trim()) {
            setError(t('payments.errors.cardholderNameRequired'));
            return;
        }

        try {
            await onSubmit({
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryDate,
                cvv,
                cardholderName,
            });
        } catch (err) {
            console.error('Payment error:', err);
            setError(t('payments.errors.paymentFailed'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            {t('payments.title')}
                        </h3>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                {t('payments.amount')}
                            </p>
                            <p className="text-2xl font-bold">
                                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('payments.cardholderName')}
                            </label>
                            <Input
                                type="text"
                                placeholder={t('payments.cardholderNamePlaceholder')}
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('payments.cardNumber')}
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    maxLength={19}
                                    className="h-12 pl-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('payments.expiryDate')}
                                </label>
                                <Input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={expiryDate}
                                    onChange={handleExpiryChange}
                                    maxLength={5}
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('payments.cvv')}
                                </label>
                                <Input
                                    type="text"
                                    placeholder="123"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                    maxLength={4}
                                    className="h-12"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span>{t('payments.secure')}</span>
                    </div>
                </CardContent>
            </Card>

            <Button
                type="submit"
                disabled={loading}
                className="w-full"
            >
                {loading ? t('common.loading') : t('payments.submit')}
            </Button>
        </form>
    );
}



