'use client';

import { useState, useEffect } from 'react';
import { vendorApi } from '@/lib/api';
import { DeathNotificationForm } from '@/components/wills/DeathNotificationForm';
import { ClientSearch } from '@/components/wills/ClientSearch';
import { useTranslations } from '@/lib/i18n';

export default function NotifyDeathPage() {
  const t = useTranslations('deathNotification');
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
      alert(t('success'));
      setSelectedClient(null);
    } catch (error) {
      console.error('Failed to notify death:', error);
      alert(t('error'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
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
