'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { DeathNotificationForm } from '@/components/wills/DeathNotificationForm';
import { ClientSearch } from '@/components/wills/ClientSearch';

export default function NotifyDeathPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getMyClients({ status: 'ACTIVE' });
      setClients(Array.isArray(data) ? data : data.appointments || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = async (notificationData: any) => {
    try {
      await vendorApi.notifyDeath(notificationData);
      alert('Уведомление о смерти успешно отправлено');
      setSelectedClient(null);
    } catch (error) {
      console.error('Failed to notify death:', error);
      alert('Ошибка при отправке уведомления');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Уведомление о смерти клиента</h1>
        <p className="text-muted-foreground">
          Уведомите компанию о смерти клиента для начала процесса исполнения завещания
        </p>
      </div>

      <ClientSearch 
        clients={clients}
        loading={loading}
        onSelectClient={setSelectedClient}
        selectedClient={selectedClient}
      />

      {selectedClient && (
        <DeathNotificationForm 
          client={selectedClient}
          onNotify={handleNotify}
          onCancel={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}



