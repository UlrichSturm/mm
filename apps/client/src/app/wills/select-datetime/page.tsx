'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { DateTimePicker } from '@/components/wills/DateTimePicker';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

export default function SelectDateTimePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lawyerId, setLawyerId] = useState<string | null>(null);

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const savedLawyerId = localStorage.getItem('selectedLawyerId');
            if (!savedLawyerId) {
                router.push('/wills/select-lawyer');
                return;
            }

            setLawyerId(savedLawyerId);
            const schedule = await apiClient.getLawyerSchedule(savedLawyerId);
            
            // Transform schedule data to our format
            // Expected format from API: { "YYYY-MM-DD": ["HH:MM", ...] }
            const slots: Record<string, string[]> = {};
            
            if (Array.isArray(schedule)) {
                schedule.forEach((slot: any) => {
                    const date = new Date(slot.date || slot.appointmentDate);
                    const dateKey = date.toISOString().split('T')[0];
                    const time = slot.time || slot.appointmentTime;
                    
                    if (!slots[dateKey]) {
                        slots[dateKey] = [];
                    }
                    if (time && !slots[dateKey].includes(time)) {
                        slots[dateKey].push(time);
                    }
                });
            } else if (typeof schedule === 'object') {
                // If schedule is already in the correct format
                Object.assign(slots, schedule);
            }

            setAvailableSlots(slots);
        } catch (err) {
            console.error('Failed to load schedule:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime) {
            return;
        }

        // Combine date and time
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const appointmentDateTime = new Date(selectedDate);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        // Save to localStorage
        localStorage.setItem('appointmentDateTime', appointmentDateTime.toISOString());

        // Redirect to confirmation page
        router.push('/wills/confirm');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12 text-muted-foreground">
                    {t('common.loading')}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorDisplay
                    error={error}
                    onRetry={loadSchedule}
                    title={t('wills.datetime.loadError')}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-heading">
                {t('wills.datetime.title')}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
                {t('wills.datetime.subtitle')}
            </p>

            <form onSubmit={handleSubmit}>
                <DateTimePicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    availableSlots={availableSlots}
                    onDateSelect={handleDateSelect}
                    onTimeSelect={handleTimeSelect}
                />

                {selectedDate && selectedTime && (
                    <Card className="mt-6 border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {t('wills.datetime.selected')}
                                </p>
                                <p className="text-lg font-semibold">
                                    {selectedDate.toLocaleDateString()} {selectedTime}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                    >
                        {t('common.back')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={!selectedDate || !selectedTime}
                        className="flex-1"
                    >
                        {t('wills.datetime.confirm')}
                    </Button>
                </div>
            </form>
        </div>
    );
}



