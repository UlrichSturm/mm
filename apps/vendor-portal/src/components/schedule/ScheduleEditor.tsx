'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

interface ScheduleEditorProps {
  schedule: any;
  onSave: (schedule: any) => Promise<void>;
  saving: boolean;
}

export function ScheduleEditor({ schedule, onSave, saving }: ScheduleEditorProps) {
  const t = useTranslations('schedule');
  const [scheduleData, setScheduleData] = useState<Record<string, { enabled: boolean; timeSlots: Array<{ start: string; end: string }> }>>({});

  const daysOfWeek = [
    { key: 'monday', label: t('monday') },
    { key: 'tuesday', label: t('tuesday') },
    { key: 'wednesday', label: t('wednesday') },
    { key: 'thursday', label: t('thursday') },
    { key: 'friday', label: t('friday') },
    { key: 'saturday', label: t('saturday') },
    { key: 'sunday', label: t('sunday') },
  ];

  useEffect(() => {
    if (schedule) {
      setScheduleData(schedule);
    } else {
      // Initialize with default structure
      const defaultSchedule: Record<string, { enabled: boolean; timeSlots: Array<{ start: string; end: string }> }> = {};
      daysOfWeek.forEach(day => {
        defaultSchedule[day.key] = {
          enabled: false,
          timeSlots: [{ start: '09:00', end: '18:00' }],
        };
      });
      setScheduleData(defaultSchedule);
    }
  }, [schedule]);

  const toggleDay = (dayKey: string) => {
    setScheduleData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey]?.enabled,
      },
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    setScheduleData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: [...(prev[dayKey]?.timeSlots || []), { start: '09:00', end: '18:00' }],
      },
    }));
  };

  const removeTimeSlot = (dayKey: string, index: number) => {
    setScheduleData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end', value: string) => {
    setScheduleData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(scheduleData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('workingHours')}</CardTitle>
        <CardDescription>
          {t('workingHoursDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {daysOfWeek.map(day => {
            const dayData = scheduleData[day.key] || { enabled: false, timeSlots: [] };
            return (
              <div key={day.key} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckboxPrimitive.Root
                      checked={dayData.enabled}
                      onCheckedChange={() => toggleDay(day.key)}
                      className={cn(
                        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                        "flex items-center justify-center"
                      )}
                    >
                      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
                        <Check className="h-4 w-4" />
                      </CheckboxPrimitive.Indicator>
                    </CheckboxPrimitive.Root>
                    <label className="text-sm font-medium">{day.label}</label>
                  </div>
                  {dayData.enabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(day.key)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('addSlot')}
                    </Button>
                  )}
                </div>

                {dayData.enabled && (
                  <div className="space-y-2 pl-6">
                    {dayData.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">—</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                          className="w-32"
                        />
                        {dayData.timeSlots.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeSlot(day.key, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Button type="submit" disabled={saving}>
            {saving ? t('saving') : t('saveSchedule')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



