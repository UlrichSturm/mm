'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ConfirmAppointmentModalProps {
  appointment: any;
  onConfirm: (data?: { appointmentDate?: string; appointmentTime?: string }) => void;
  onCancel: () => void;
  loading: boolean;
}

export function ConfirmAppointmentModal({ 
  appointment, 
  onConfirm, 
  onCancel, 
  loading 
}: ConfirmAppointmentModalProps) {
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {};
    if (appointmentDate) data.appointmentDate = appointmentDate;
    if (appointmentTime) data.appointmentTime = appointmentTime;
    onConfirm(Object.keys(data).length > 0 ? data : undefined);
  };

  return (
    <DialogPrimitive.Root open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-background border rounded-lg shadow-lg">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Подтверждение заявки</CardTitle>
                <DialogPrimitive.Close asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogPrimitive.Close>
              </div>
              <CardDescription>
                Подтвердите заявку или измените дату/время встречи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="appointmentDate" className="block text-sm font-medium mb-1">
                    Дата встречи (опционально)
                  </label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="appointmentTime" className="block text-sm font-medium mb-1">
                    Время встречи (опционально)
                  </label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Подтверждение...' : 'Подтвердить'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

