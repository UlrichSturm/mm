'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, MapPin, User, Phone, Mail } from 'lucide-react';

interface AppointmentDetailsProps {
  appointment: any;
}

export function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  const appointmentDate = appointment.appointmentDate 
    ? format(new Date(appointment.appointmentDate), 'dd MMMM yyyy, HH:mm', { locale: ru })
    : 'Не указана';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о заявке</CardTitle>
        <CardDescription>Детали заявки и контактная информация</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Дата и время:</span>
            <span>{appointmentDate}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Место встречи:</span>
            <span>
              {appointment.location === 'office' ? 'Офис' : 'Выезд на дом'}
            </span>
          </div>

          {appointment.clientAddress && (
            <div className="flex items-start gap-2 text-sm pl-6">
              <span className="text-muted-foreground">Адрес:</span>
              <span>{appointment.clientAddress}</span>
            </div>
          )}

          {appointment.clientName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Клиент:</span>
              <span>{appointment.clientName}</span>
            </div>
          )}

          {appointment.clientPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Телефон:</span>
              <span>{appointment.clientPhone}</span>
            </div>
          )}

          {appointment.clientEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span>{appointment.clientEmail}</span>
            </div>
          )}

          {appointment.insurance && (
            <div className="text-sm">
              <span className="font-medium">Страхование:</span>
              <span className="ml-2">Да</span>
            </div>
          )}

          {appointment.paymentMethod && (
            <div className="text-sm">
              <span className="font-medium">Способ оплаты:</span>
              <span className="ml-2">
                {appointment.paymentMethod === 'prepayment' && 'Предоплата'}
                {appointment.paymentMethod === 'insurance' && 'Страхование'}
                {appointment.paymentMethod === 'relatives' && 'Родственники'}
              </span>
            </div>
          )}

          {appointment.createdAt && (
            <div className="text-sm text-muted-foreground pt-2 border-t">
              <span>Создана: </span>
              <span>{format(new Date(appointment.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



