'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslations } from '@/lib/i18n';

interface ClientSearchProps {
  clients: any[];
  loading: boolean;
  onSelectClient: (client: any) => void;
  selectedClient: any;
}

export function ClientSearch({
  clients,
  loading,
  onSelectClient,
  selectedClient: _selectedClient,
}: ClientSearchProps) {
  const t = useTranslations('deathNotification');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'name' | 'appointment'>('name');

  const filteredClients = clients.filter(client => {
    if (!searchQuery) {
      return false;
    }

    if (searchBy === 'name') {
      return client.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return (
        client.id?.toString().includes(searchQuery) ||
        client.appointmentNumber?.toString().includes(searchQuery)
      );
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('clientSearch')}</CardTitle>
        <CardDescription>{t('clientSearchDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchBy}
            onChange={e => setSearchBy(e.target.value as 'name' | 'appointment')}
          >
            <option value="name">{t('searchByName')}</option>
            <option value="appointment">{t('searchByAppointment')}</option>
          </select>
          <Input
            placeholder={searchBy === 'name' ? t('enterClientName') : t('enterAppointmentNumber')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
        ) : searchQuery && filteredClients.length > 0 ? (
          <div className="space-y-2">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onSelectClient(client)}
              >
                <div>
                  <p className="font-medium">{client.clientName || t('clientWithoutName')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('application')}{client.id || client.appointmentNumber}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('select')}
                </Button>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <p className="text-sm text-muted-foreground">{t('clientsNotFound')}</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('activeClients')}</p>
            {clients.length > 0 ? (
              <div className="space-y-2">
                {clients.slice(0, 5).map(client => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => onSelectClient(client)}
                  >
                    <div>
                      <p className="font-medium">{client.clientName || t('clientWithoutName')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('application')}{client.id || client.appointmentNumber}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('select')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('noActiveClients')}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
