'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { ScheduleEditor } from '@/components/schedule/ScheduleEditor';
import { BlockedDates } from '@/components/schedule/BlockedDates';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
    loadBlockedDates();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getMySchedule();
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedDates = async () => {
    try {
      const data = await vendorApi.getMySchedule();
      // Assuming blockedDates is part of schedule response
      if (data?.blockedDates) {
        setBlockedDates(data.blockedDates);
      }
    } catch (error) {
      console.error('Failed to load blocked dates:', error);
    }
  };

  const handleSave = async (updatedSchedule: any) => {
    try {
      setSaving(true);
      await vendorApi.updateSchedule(updatedSchedule);
      await loadSchedule();
      alert('Расписание успешно сохранено');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Ошибка при сохранении расписания');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async (date: string) => {
    try {
      await vendorApi.blockDate(date);
      await loadBlockedDates();
      alert('Дата успешно заблокирована');
    } catch (error) {
      console.error('Failed to block date:', error);
      throw error;
    }
  };

  const handleUnblockDate = async (date: string) => {
    try {
      await vendorApi.unblockDate(date);
      await loadBlockedDates();
      alert('Дата успешно разблокирована');
    } catch (error) {
      console.error('Failed to unblock date:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление расписанием</h1>
        <p className="text-muted-foreground">
          Настройте рабочие часы и доступность для клиентов
        </p>
      </div>

      <ScheduleEditor 
        schedule={schedule} 
        onSave={handleSave}
        saving={saving}
      />

      <BlockedDates 
        blockedDates={blockedDates}
        onBlockDate={handleBlockDate}
        onUnblockDate={handleUnblockDate}
      />
    </div>
  );
}

