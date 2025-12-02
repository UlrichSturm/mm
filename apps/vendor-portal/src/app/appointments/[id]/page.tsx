'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AppointmentActions } from '@/components/appointments/AppointmentActions';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentDetailPage() {
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getAppointment(appointmentId);
      setAppointment(data);
    } catch (error) {
      console.error('Failed to load appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    await loadAppointment();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-6">
        <Link href="/appointments">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к заявкам
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p>Заявка не найдена</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/appointments">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              Заявка #{appointment.id || appointment.appointmentNumber || 'N/A'}
            </h1>
            <StatusBadge status={appointment.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AppointmentDetails appointment={appointment} />
        <AppointmentActions appointment={appointment} onAction={handleAction} />
      </div>
    </div>
  );
}
