'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CreditCard, Shield, Users } from 'lucide-react';

interface PaymentMethodSelectorProps {
    selectedMethod: 'prepayment' | 'insurance' | 'relatives' | null;
    onSelect: (method: 'prepayment' | 'insurance' | 'relatives') => void;
    insuranceSelected: boolean;
}

export function PaymentMethodSelector({
    selectedMethod,
    onSelect,
    insuranceSelected,
}: PaymentMethodSelectorProps) {
    const { t } = useLanguage();

    const methods = [
        {
            id: 'prepayment' as const,
            title: t('wills.confirm.payment.prepayment.title'),
            description: t('wills.confirm.payment.prepayment.description'),
            icon: CreditCard,
        },
        {
            id: 'insurance' as const,
            title: t('wills.confirm.payment.insurance.title'),
            description: t('wills.confirm.payment.insurance.description'),
            icon: Shield,
            disabled: !insuranceSelected,
        },
        {
            id: 'relatives' as const,
            title: t('wills.confirm.payment.relatives.title'),
            description: t('wills.confirm.payment.relatives.description'),
            icon: Users,
        },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">
                {t('wills.confirm.payment.title')}
            </h3>
            {methods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                const isDisabled = method.disabled;

                return (
                    <Card
                        key={method.id}
                        className={`cursor-pointer transition-all ${
                            isSelected ? 'border-primary shadow-md' : 'hover:border-primary/50'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isDisabled && onSelect(method.id)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${
                                    isSelected ? 'bg-primary/10' : 'bg-muted'
                                }`}>
                                    <Icon className={`w-6 h-6 ${
                                        isSelected ? 'text-primary' : 'text-muted-foreground'
                                    }`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">{method.title}</h4>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            isSelected ? 'bg-primary border-primary' : 'border-input'
                                        }`}>
                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {method.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}



