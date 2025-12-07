'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useTranslations } from '@/lib/i18n';

interface AppointmentFiltersProps {
  filters: {
    status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function AppointmentFilters({ filters, onFiltersChange }: AppointmentFiltersProps) {
  const t = useTranslations('appointments');

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'PENDING', label: t('pending') },
    { value: 'CONFIRMED', label: t('confirmed') },
    { value: 'IN_PROGRESS', label: t('inProgress') },
    { value: 'COMPLETED', label: t('completed') },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t('searchPlaceholder')}
              value={filters.search || ''}
              onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="w-[200px]">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filters.status || ''}
              onChange={e =>
                onFiltersChange({ ...filters, status: (e.target.value as any) || undefined })
              }
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
