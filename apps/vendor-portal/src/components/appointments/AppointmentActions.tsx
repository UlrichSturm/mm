'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { ConfirmAppointmentModal } from '@/components/appointments/ConfirmAppointmentModal';
import Link from 'next/link';

interface AppointmentActionsProps {
  appointment: any;
  onAction: () => void;
}

export function AppointmentActions({ appointment, onAction }: AppointmentActionsProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (data?: { appointmentDate?: string; appointmentTime?: string }) => {
    try {
      setLoading(true);
      await vendorApi.confirmAppointment(appointment.id, data);
      setShowConfirmModal(false);
      onAction();
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      alert('Ошибка при подтверждении заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Вы уверены, что хотите отклонить эту заявку?')) {
      return;
    }

    try {
      setLoading(true);
      await vendorApi.cancelAppointment(appointment.id);
      onAction();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Ошибка при отмене заявки');
    } finally {
      setLoading(false);
    }
  };

  const renderActions = () => {
    switch (appointment.status) {
      case 'PENDING':
        return (
          <div className="space-y-2">
            <Button 
              onClick={() => setShowConfirmModal(true)}
              className="w-full"
            >
              Подтвердить заявку
            </Button>
            <Button 
              onClick={handleCancel}
              variant="destructive"
              className="w-full"
              disabled={loading}
            >
              Отклонить
            </Button>
          </div>
        );
      
      case 'CONFIRMED':
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Заявка подтверждена. Встреча запланирована.
            </p>
          </div>
        );
      
      case 'IN_PROGRESS':
        return (
          <div className="space-y-2">
            <Link href={`/appointments/${appointment.id}/complete`}>
              <Button className="w-full">
                Завершить и внести данные
              </Button>
            </Link>
          </div>
        );
      
      case 'COMPLETED':
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Заявка завершена. Данные завещания внесены.
            </p>
            {appointment.willData && (
              <Link href={`/appointments/${appointment.id}/will-data`}>
                <Button variant="outline" className="w-full">
                  Просмотр данных завещания
                </Button>
              </Link>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
          <CardDescription>Доступные действия для этой заявки</CardDescription>
        </CardHeader>
        <CardContent>
          {renderActions()}
        </CardContent>
      </Card>

      {showConfirmModal && (
        <ConfirmAppointmentModal
          appointment={appointment}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmModal(false)}
          loading={loading}
        />
      )}
    </>
  );
}



