'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, MapPin, User } from 'lucide-react';

interface AppointmentCardProps {
  appointment: any;
  onRefresh: () => void;
}

export function AppointmentCard({ appointment, onRefresh: _onRefresh }: AppointmentCardProps) {
  const appointmentDate = appointment.appointmentDate
    ? format(new Date(appointment.appointmentDate), 'dd MMMM yyyy, HH:mm', { locale: ru })
    : 'Не указана';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                Заявка #{appointment.id || appointment.appointmentNumber || 'N/A'}
              </h3>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              {appointment.clientName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{appointment.clientName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{appointmentDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {appointment.location === 'office' ? 'Офис' : 'Выезд на дом'}
                  {appointment.clientAddress && ` - ${appointment.clientAddress}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/appointments/${appointment.id}`}>
              <Button variant="outline">Подробнее</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
