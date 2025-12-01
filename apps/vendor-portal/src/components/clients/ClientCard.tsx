'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { User, Calendar } from 'lucide-react';

interface ClientCardProps {
  client: any;
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Активное',
  EXECUTING: 'В процессе исполнения',
  EXECUTED: 'Исполнено',
};

export function ClientCard({ client }: ClientCardProps) {
  const lastContact = client.lastContact
    ? format(new Date(client.lastContact), 'dd MMMM yyyy', { locale: ru })
    : 'Не указана';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">{client.name}</h3>
              <StatusBadge status={client.status} />
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Последний контакт: {lastContact}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Заявок: {client.appointments?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Подробнее</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



