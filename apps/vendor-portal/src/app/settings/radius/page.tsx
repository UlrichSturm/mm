'use client';

import { useState, useEffect } from 'react';
import { vendorApi } from '@/lib/api';
import { RadiusSettings } from '@/components/settings/RadiusSettings';
import { HomeVisitSettings } from '@/components/settings/HomeVisitSettings';
import { useTranslations } from '@/lib/i18n';

export default function RadiusSettingsPage() {
  const t = useTranslations('settings');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getMySettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedSettings: any) => {
    try {
      setSaving(true);
      await vendorApi.updateSettings(updatedSettings);
      await loadSettings();
      alert(t('saveSuccess'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(t('saveError'));
    } finally {
      setSaving(false);
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

      <RadiusSettings settings={settings} onSave={handleSave} saving={saving} />

      <HomeVisitSettings settings={settings} onSave={handleSave} saving={saving} />
    </div>
  );
}
