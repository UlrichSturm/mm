'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
        <CardTitle>Поиск клиента</CardTitle>
        <CardDescription>Найдите клиента по имени или номеру заявки</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchBy}
            onChange={e => setSearchBy(e.target.value as 'name' | 'appointment')}
          >
            <option value="name">По имени</option>
            <option value="appointment">По номеру заявки</option>
          </select>
          <Input
            placeholder={searchBy === 'name' ? 'Введите имя клиента' : 'Введите номер заявки'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : searchQuery && filteredClients.length > 0 ? (
          <div className="space-y-2">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onSelectClient(client)}
              >
                <div>
                  <p className="font-medium">{client.clientName || 'Клиент без имени'}</p>
                  <p className="text-sm text-muted-foreground">
                    Заявка #{client.id || client.appointmentNumber}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Выбрать
                </Button>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <p className="text-sm text-muted-foreground">Клиенты не найдены</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Активные клиенты:</p>
            {clients.length > 0 ? (
              <div className="space-y-2">
                {clients.slice(0, 5).map(client => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => onSelectClient(client)}
                  >
                    <div>
                      <p className="font-medium">{client.clientName || 'Клиент без имени'}</p>
                      <p className="text-sm text-muted-foreground">
                        Заявка #{client.id || client.appointmentNumber}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Выбрать
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Активных клиентов нет</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
