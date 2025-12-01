'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface RadiusSettingsProps {
  settings: any;
  onSave: (settings: any) => Promise<void>;
  saving: boolean;
}

export function RadiusSettings({ settings, onSave, saving }: RadiusSettingsProps) {
  const [officePostalCode, setOfficePostalCode] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeRadius, setOfficeRadius] = useState(10);

  useEffect(() => {
    if (settings) {
      setOfficePostalCode(settings.officePostalCode || '');
      setOfficeAddress(settings.officeAddress || '');
      setOfficeRadius(settings.officeRadius || 10);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!officePostalCode || !officeAddress || !officeRadius) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (officeRadius <= 0 || officeRadius > 100) {
      alert('Радиус должен быть от 1 до 100 км');
      return;
    }

    await onSave({
      officePostalCode,
      officeAddress,
      officeRadius: Number(officeRadius),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки офиса</CardTitle>
        <CardDescription>
          Укажите адрес офиса и радиус поиска для клиентов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="officePostalCode" className="block text-sm font-medium mb-1">
              Почтовый индекс офиса *
            </label>
            <Input
              id="officePostalCode"
              type="text"
              value={officePostalCode}
              onChange={(e) => setOfficePostalCode(e.target.value)}
              placeholder="123456"
              required
            />
          </div>

          <div>
            <label htmlFor="officeAddress" className="block text-sm font-medium mb-1">
              Полный адрес офиса *
            </label>
            <Input
              id="officeAddress"
              type="text"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="Город, улица, дом"
              required
            />
          </div>

          <div>
            <label htmlFor="officeRadius" className="block text-sm font-medium mb-1">
              Радиус поиска (км) *
            </label>
            <Input
              id="officeRadius"
              type="number"
              min="1"
              max="100"
              value={officeRadius}
              onChange={(e) => setOfficeRadius(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Клиенты в пределах этого радиуса смогут найти вас при поиске
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить настройки офиса'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



