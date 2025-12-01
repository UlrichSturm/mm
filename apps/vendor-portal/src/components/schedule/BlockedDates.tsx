'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BlockedDatesProps {
  blockedDates?: string[];
  onBlockDate: (date: string) => Promise<void>;
  onUnblockDate?: (date: string) => Promise<void>;
}

export function BlockedDates({ blockedDates = [], onBlockDate, onUnblockDate }: BlockedDatesProps) {
  const [newBlockDate, setNewBlockDate] = useState('');
  const [blocking, setBlocking] = useState(false);

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) {
      alert('Пожалуйста, выберите дату');
      return;
    }

    try {
      setBlocking(true);
      await onBlockDate(newBlockDate);
      setNewBlockDate('');
    } catch (error) {
      console.error('Failed to block date:', error);
      alert('Ошибка при блокировке даты');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockDate = async (date: string) => {
    if (!onUnblockDate) return;
    
    if (!confirm('Вы уверены, что хотите разблокировать эту дату?')) {
      return;
    }

    try {
      await onUnblockDate(date);
    } catch (error) {
      console.error('Failed to unblock date:', error);
      alert('Ошибка при разблокировке даты');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Блокировка дат</CardTitle>
        <CardDescription>
          Заблокируйте конкретные даты (отпуск, выходные дни)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleBlockDate} className="flex gap-2">
          <Input
            type="date"
            value={newBlockDate}
            onChange={(e) => setNewBlockDate(e.target.value)}
            className="flex-1"
            min={new Date().toISOString().split('T')[0]}
          />
          <Button type="submit" disabled={blocking}>
            {blocking ? 'Блокировка...' : 'Заблокировать'}
          </Button>
        </form>

        {blockedDates.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Заблокированные даты:</p>
            <div className="space-y-1">
              {blockedDates.map((date) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(date), 'dd MMMM yyyy', { locale: ru })}
                    </span>
                  </div>
                  {onUnblockDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnblockDate(date)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Нет заблокированных дат</p>
        )}
      </CardContent>
    </Card>
  );
}



