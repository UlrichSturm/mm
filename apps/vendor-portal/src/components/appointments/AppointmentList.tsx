'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';

interface AppointmentListProps {
  appointments: any[];
  onRefresh: () => void;
}

export function AppointmentList({ appointments, onRefresh: _onRefresh }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Заявок пока нет</p>
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
