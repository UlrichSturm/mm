'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { vendorApi } from '@/lib/api';
import { ClientList } from '@/components/clients/ClientList';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status?: 'ACTIVE' | 'EXECUTING' | 'EXECUTED';
    search?: string;
  }>({});

  useEffect(() => {
    loadClients();
  }, [filters]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getMyClients(filters);
      // Transform appointments to clients
      const appointments = Array.isArray(data) ? data : data.appointments || [];
      const clientsMap = new Map();
      
      appointments.forEach((appointment: any) => {
        if (appointment.clientName || appointment.clientId) {
          const clientId = appointment.clientId || appointment.clientName;
          if (!clientsMap.has(clientId)) {
            clientsMap.set(clientId, {
              id: clientId,
              name: appointment.clientName || 'Не указано',
              appointments: [],
              lastContact: appointment.appointmentDate || appointment.createdAt,
              status: appointment.willStatus || 'ACTIVE',
            });
          }
          clientsMap.get(clientId).appointments.push(appointment);
        }
      });
      
      setClients(Array.from(clientsMap.values()));
    } catch (error) {
      console.error('Failed to load clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <p className="text-muted-foreground">
          Список всех ваших клиентов
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Поиск по ФИО..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="w-[200px]">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              >
                <option value="">Все статусы</option>
                <option value="ACTIVE">Активные</option>
                <option value="EXECUTING">В процессе исполнения</option>
                <option value="EXECUTED">Исполнены</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Загрузка...</p>
        </div>
      ) : (
        <ClientList clients={clients} />
      )}
    </div>
  );
}



