'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AppointmentListProps {
  appointments: any[];
  onRefresh: () => void;
}

export function AppointmentList({ appointments, onRefresh }: AppointmentListProps) {
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
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}



