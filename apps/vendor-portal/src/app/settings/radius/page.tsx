'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { RadiusSettings } from '@/components/settings/RadiusSettings';
import { HomeVisitSettings } from '@/components/settings/HomeVisitSettings';

export default function RadiusSettingsPage() {
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
      alert('Настройки успешно сохранены');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold">Настройки радиуса поиска</h1>
        <p className="text-muted-foreground">
          Настройте радиус поиска для вашего офиса и выезда на дом
        </p>
      </div>

      <RadiusSettings 
        settings={settings} 
        onSave={handleSave}
        saving={saving}
      />

      <HomeVisitSettings 
        settings={settings} 
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}



