'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
    search?: string;
  }>({});

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
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
          <h1 className="text-3xl font-bold">Заявки</h1>
          <p className="text-muted-foreground">
            Управление заявками от клиентов
          </p>
        </div>
      </div>

      <AppointmentFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Загрузка...</p>
        </div>
      ) : (
        <AppointmentList 
          appointments={appointments}
          onRefresh={loadAppointments}
        />
      )}
    </div>
  );
}



