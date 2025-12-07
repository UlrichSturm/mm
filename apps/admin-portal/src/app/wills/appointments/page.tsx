'use client';

import { useEffect, useState } from 'react';
import {
  willsApi,
  WillAppointment,
  WillAppointmentFilters,
  AppointmentStatus,
} from '@/lib/api/wills';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { Search, Calendar, User, MapPin, Eye } from 'lucide-react';
import { exportAppointmentsToCSV } from '@/lib/utils/export';
import { ExportButton } from '@/components/shared/ExportButton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<WillAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WillAppointmentFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await willsApi.getAllAppointments(filters);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
      console.error('[Appointments] Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery || undefined }));
  };

  const handleStatusFilter = (status?: AppointmentStatus) => {
    setFilters(prev => ({ ...prev, status }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Заявки на завещания</h1>
        <ExportButton
          onExport={() => exportAppointmentsToCSV(appointments)}
          disabled={appointments.length === 0}
        />
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
          onRetry={loadAppointments}
          showRetry={true}
        />
      )}

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by appointment number, client name, or lawyer name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSearch}>Поиск</Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filters.status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter(undefined)}
              >
                Все статусы
              </Button>
              <Button
                variant={filters.status === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={filters.status === 'CONFIRMED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('CONFIRMED')}
              >
                Confirmed
              </Button>
              <Button
                variant={filters.status === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('COMPLETED')}
              >
                Completed
              </Button>
              <Button
                variant={filters.status === 'CANCELLED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('CANCELLED')}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Заявки не найдены</p>
            </CardContent>
          </Card>
        ) : (
          appointments.map(appointment => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Заявка #{appointment.id.slice(0, 8)}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                        {statusLabels[appointment.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <span className="font-medium">Клиент:</span>{' '}
                          {appointment.client?.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <span className="font-medium">Lawyer:</span>{' '}
                          {appointment.lawyerNotary?.licenseNumber || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <span className="font-medium">Дата:</span>{' '}
                          {new Date(appointment.appointmentDate).toLocaleDateString('ru-RU')} в{' '}
                          {appointment.appointmentTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          <span className="font-medium">Место:</span> {appointment.location}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Создано:</span>{' '}
                        {new Date(appointment.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link href={`/wills/data/${appointment.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Просмотр
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
