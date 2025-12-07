'use client';

import { useState, useEffect } from 'react';
import { vendorApi } from '@/lib/api';
import { ScheduleEditor } from '@/components/schedule/ScheduleEditor';
import { BlockedDates } from '@/components/schedule/BlockedDates';
import { useTranslations } from '@/lib/i18n';

export default function SchedulePage() {
  const t = useTranslations('schedule');
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
      alert(t('saveSuccess'));
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async (date: string) => {
    try {
      await vendorApi.blockDate(date);
      await loadBlockedDates();
      alert(t('blockSuccess'));
    } catch (error) {
      console.error('Failed to block date:', error);
      throw error;
    }
  };

  const handleUnblockDate = async (date: string) => {
    try {
      await vendorApi.unblockDate(date);
      await loadBlockedDates();
      alert(t('unblockSuccess'));
    } catch (error) {
      console.error('Failed to unblock date:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <ScheduleEditor schedule={schedule} onSave={handleSave} saving={saving} />

      <BlockedDates
        blockedDates={blockedDates}
        onBlockDate={handleBlockDate}
        onUnblockDate={handleUnblockDate}
      />
    </div>
  );
}
