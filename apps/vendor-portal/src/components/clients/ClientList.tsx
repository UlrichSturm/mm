'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { ClientCard } from './ClientCard';
import { useTranslations } from '@/lib/i18n';

interface ClientListProps {
  clients: any[];
}

export function ClientList({ clients }: ClientListProps) {
  const t = useTranslations('clients');

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noClients')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}



