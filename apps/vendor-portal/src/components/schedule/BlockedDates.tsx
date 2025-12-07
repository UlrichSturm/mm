'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { useTranslations, getLocale } from '@/lib/i18n';

interface BlockedDatesProps {
  blockedDates?: string[];
  onBlockDate: (date: string) => Promise<void>;
  onUnblockDate?: (date: string) => Promise<void>;
}

export function BlockedDates({ blockedDates = [], onBlockDate, onUnblockDate }: BlockedDatesProps) {
  const t = useTranslations('schedule');
  const [newBlockDate, setNewBlockDate] = useState('');
  const [blocking, setBlocking] = useState(false);
  const locale = getLocale();
  const dateLocale = locale === 'ru' ? ru : enUS;

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) {
      alert(t('selectDate'));
      return;
    }

    try {
      setBlocking(true);
      await onBlockDate(newBlockDate);
      setNewBlockDate('');
    } catch (error) {
      console.error('Failed to block date:', error);
      alert(t('blockError'));
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockDate = async (date: string) => {
    if (!onUnblockDate) {
      return;
    }

    if (!confirm(t('unblockConfirm'))) {
      return;
    }

    try {
      await onUnblockDate(date);
    } catch (error) {
      console.error('Failed to unblock date:', error);
      alert(t('unblockError'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('blockedDates')}</CardTitle>
        <CardDescription>{t('blockedDatesDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleBlockDate} className="flex gap-2">
          <Input
            type="date"
            value={newBlockDate}
            onChange={e => setNewBlockDate(e.target.value)}
            className="flex-1"
            min={new Date().toISOString().split('T')[0]}
          />
          <Button type="submit" disabled={blocking}>
            {blocking ? t('blocking') : t('block')}
          </Button>
        </form>

        {blockedDates.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('blockedDatesList')}</p>
            <div className="space-y-1">
              {blockedDates.map(date => (
                <div key={date} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(date), 'dd MMMM yyyy', { locale: dateLocale })}
                    </span>
                  </div>
                  {onUnblockDate && (
                    <Button variant="ghost" size="icon" onClick={() => handleUnblockDate(date)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('noBlockedDates')}</p>
        )}
      </CardContent>
    </Card>
  );
}
