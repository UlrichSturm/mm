'use client';

import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { Card, CardContent } from '@/components/ui/Card';
import { useTranslations } from '@/lib/i18n';

interface AppointmentListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[];
  onRefresh: () => void;
}

export function AppointmentList({ appointments, onRefresh }: AppointmentListProps) {
  const t = useTranslations('appointments');

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noApplications')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
