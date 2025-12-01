'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Shield } from 'lucide-react';

interface InsuranceOptionProps {
    selected: boolean;
    onToggle: (selected: boolean) => void;
    coverageAmount?: number;
    onCoverageChange?: (amount: number) => void;
    monthlyPayment?: number;
}

export function InsuranceOption({
    selected,
    onToggle,
    coverageAmount,
    onCoverageChange,
    monthlyPayment,
}: InsuranceOptionProps) {
    const { t } = useLanguage();

    return (
        <Card
            className={`cursor-pointer transition-all ${
                selected ? 'border-primary shadow-md' : 'hover:border-primary/50'
            }`}
            onClick={() => onToggle(!selected)}
        >
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                        selected ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                        <Shield className={`w-6 h-6 ${
                            selected ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                                {t('wills.confirm.insurance.title')}
                            </h3>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selected ? 'bg-primary border-primary' : 'border-input'
                            }`}>
                                {selected && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('wills.confirm.insurance.description')}
                        </p>
                        {selected && onCoverageChange && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('wills.confirm.insurance.coverageLabel')}
                                </label>
                                <Input
                                    type="number"
                                    placeholder={t('wills.confirm.insurance.coveragePlaceholder')}
                                    value={coverageAmount || ''}
                                    onChange={(e) => onCoverageChange(Number(e.target.value))}
                                    className="h-12"
                                    min="0"
                                />
                                {monthlyPayment && (
                                    <p className="text-sm text-muted-foreground">
                                        {t('wills.confirm.insurance.monthlyPayment')}: ${monthlyPayment}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}



