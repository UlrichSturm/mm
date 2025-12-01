'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, MapPin, Briefcase, Home } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LawyerCardProps {
    lawyer: {
        id: string;
        name: string;
        rating?: number;
        licenseType: 'lawyer' | 'notary' | 'both';
        postalCode: string;
        address: string;
        homeVisitAvailable: boolean;
        specialization?: string;
        maxTravelRadius?: number;
    };
    onSelect: (lawyerId: string) => void;
}

export function LawyerCard({ lawyer, onSelect }: LawyerCardProps) {
    const { t } = useLanguage();

    const getLicenseTypeText = () => {
        switch (lawyer.licenseType) {
            case 'lawyer':
                return t('wills.lawyer.licenseType.lawyer');
            case 'notary':
                return t('wills.lawyer.licenseType.notary');
            case 'both':
                return t('wills.lawyer.licenseType.both');
            default:
                return '';
        }
    };

    return (
        <Card className="hover:border-primary/50 hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold">{lawyer.name}</h3>
                            {lawyer.rating && (
                                <div className="flex items-center gap-1 text-sm">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{lawyer.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span>{getLicenseTypeText()}</span>
                            </div>

                            {lawyer.specialization && (
                                <div className="text-sm">
                                    <span className="font-medium">{t('wills.lawyer.specialization')}: </span>
                                    {lawyer.specialization}
                                </div>
                            )}

                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <div>
                                    <div>{lawyer.address}</div>
                                    <div className="text-xs">{lawyer.postalCode}</div>
                                </div>
                            </div>

                            {lawyer.homeVisitAvailable && (
                                <div className="flex items-center gap-2">
                                    <Home className="w-4 h-4" />
                                    <span>
                                        {t('wills.lawyer.homeVisit')}
                                        {lawyer.maxTravelRadius && ` (${t('wills.lawyer.radius')}: ${lawyer.maxTravelRadius} km)`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={() => onSelect(lawyer.id)}
                        className="sm:ml-4"
                    >
                        {t('wills.lawyer.select')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

