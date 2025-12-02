'use client';

import { useState, useEffect } from 'react';
import { vendorApi } from '@/lib/api';
import { AppointmentsCalendar } from '@/components/calendar/AppointmentsCalendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

export default function AppointmentsCalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter) {
        filters.status = statusFilter as any;
      }
      const data = await vendorApi.getMyAppointments(filters);
      setAppointments(Array.isArray(data) ? data : data.appointments || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Календарь встреч</h1>
          <p className="text-muted-foreground">Просмотр всех встреч в календарном виде</p>
        </div>
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все статусы</SelectItem>
              <SelectItem value="PENDING">Ожидают подтверждения</SelectItem>
              <SelectItem value="CONFIRMED">Подтверждены</SelectItem>
              <SelectItem value="IN_PROGRESS">В процессе</SelectItem>
              <SelectItem value="COMPLETED">Завершены</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Загрузка...</p>
        </div>
      ) : (
        <AppointmentsCalendar
          appointments={appointments}
          onAppointmentClick={appointment => {
            window.location.href = `/appointments/${appointment.id}`;
          }}
        />
      )}
    </div>
  );
}
