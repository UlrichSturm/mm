'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Calendar, Clock, User, Building2, Home } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AppointmentSummaryProps {
  lawyerName: string;
  location: 'office' | 'home';
  address: string;
  date: Date;
  time: string;
}

export function AppointmentSummary({
  lawyerName,
  location,
  address,
  date,
  time,
}: AppointmentSummaryProps) {
  const { t } = useLanguage();

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('wills.confirm.summary.title')}</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('wills.confirm.summary.lawyer')}</p>
              <p className="font-medium">{lawyerName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {location === 'office' ? (
              <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
            ) : (
              <Home className="w-5 h-5 text-muted-foreground mt-0.5" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                {location === 'office'
                  ? t('wills.confirm.summary.location.office')
                  : t('wills.confirm.summary.location.home')}
              </p>
              <p className="font-medium">{address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('wills.confirm.summary.date')}</p>
              <p className="font-medium">{date.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('wills.confirm.summary.time')}</p>
              <p className="font-medium">{time}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
