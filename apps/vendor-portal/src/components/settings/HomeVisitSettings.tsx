'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeVisitSettingsProps {
  settings: any;
  onSave: (settings: any) => Promise<void>;
  saving: boolean;
}

export function HomeVisitSettings({ settings, onSave, saving }: HomeVisitSettingsProps) {
  const [homeVisitEnabled, setHomeVisitEnabled] = useState(false);
  const [homeVisitPostalCode, setHomeVisitPostalCode] = useState('');
  const [homeVisitRadius, setHomeVisitRadius] = useState(10);

  useEffect(() => {
    if (settings) {
      setHomeVisitEnabled(settings.homeVisitEnabled || false);
      setHomeVisitPostalCode(settings.homeVisitPostalCode || '');
      setHomeVisitRadius(settings.homeVisitRadius || 10);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (homeVisitEnabled) {
      if (!homeVisitPostalCode || !homeVisitRadius) {
        alert('Пожалуйста, заполните все поля для выезда на дом');
        return;
      }

      if (homeVisitRadius <= 0 || homeVisitRadius > 100) {
        alert('Радиус должен быть от 1 до 100 км');
        return;
      }
    }

    await onSave({
      homeVisitEnabled,
      homeVisitPostalCode: homeVisitEnabled ? homeVisitPostalCode : undefined,
      homeVisitRadius: homeVisitEnabled ? Number(homeVisitRadius) : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки выезда на дом</CardTitle>
        <CardDescription>
          Настройте возможность предоставления услуг на выезде
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckboxPrimitive.Root
              id="homeVisitEnabled"
              checked={homeVisitEnabled}
              onCheckedChange={(checked) => setHomeVisitEnabled(checked === true)}
              className={cn(
                "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                "flex items-center justify-center"
              )}
            >
              <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
                <Check className="h-4 w-4" />
              </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
            <label htmlFor="homeVisitEnabled" className="text-sm font-medium cursor-pointer">
              Предоставляю услугу на выезде
            </label>
          </div>

          {homeVisitEnabled && (
            <>
              <div>
                <label htmlFor="homeVisitPostalCode" className="block text-sm font-medium mb-1">
                  Почтовый индекс базы выезда *
                </label>
                <Input
                  id="homeVisitPostalCode"
                  type="text"
                  value={homeVisitPostalCode}
                  onChange={(e) => setHomeVisitPostalCode(e.target.value)}
                  placeholder="123456"
                  required={homeVisitEnabled}
                />
              </div>

              <div>
                <label htmlFor="homeVisitRadius" className="block text-sm font-medium mb-1">
                  Радиус выезда (км) *
                </label>
                <Input
                  id="homeVisitRadius"
                  type="number"
                  min="1"
                  max="100"
                  value={homeVisitRadius}
                  onChange={(e) => setHomeVisitRadius(Number(e.target.value))}
                  required={homeVisitEnabled}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Максимальное расстояние от базы выезда
                </p>
              </div>
            </>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить настройки выезда'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

