'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { TimeSlotSelector } from './TimeSlotSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
    selectedDate: Date | null;
    selectedTime: string | null;
    availableSlots: Record<string, string[]>; // { "YYYY-MM-DD": ["HH:MM", ...] }
    onDateSelect: (date: Date) => void;
    onTimeSelect: (time: string) => void;
}

export function DateTimePicker({
    selectedDate,
    selectedTime,
    availableSlots,
    onDateSelect,
    onTimeSelect,
}: DateTimePickerProps) {
    const { t } = useLanguage();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const monthNames = [
        t('wills.datetime.months.january'),
        t('wills.datetime.months.february'),
        t('wills.datetime.months.march'),
        t('wills.datetime.months.april'),
        t('wills.datetime.months.may'),
        t('wills.datetime.months.june'),
        t('wills.datetime.months.july'),
        t('wills.datetime.months.august'),
        t('wills.datetime.months.september'),
        t('wills.datetime.months.october'),
        t('wills.datetime.months.november'),
        t('wills.datetime.months.december'),
    ];

    const weekDays = [
        t('wills.datetime.weekdays.sunday'),
        t('wills.datetime.weekdays.monday'),
        t('wills.datetime.weekdays.tuesday'),
        t('wills.datetime.weekdays.wednesday'),
        t('wills.datetime.weekdays.thursday'),
        t('wills.datetime.weekdays.friday'),
        t('wills.datetime.weekdays.saturday'),
    ];

    const formatDateKey = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const isDateAvailable = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        // Can't select past dates
        if (checkDate < today) {
            return false;
        }

        const dateKey = formatDateKey(date);
        return availableSlots[dateKey] && availableSlots[dateKey].length > 0;
    };

    const isDateSelected = (date: Date): boolean => {
        if (!selectedDate) return false;
        return formatDateKey(date) === formatDateKey(selectedDate);
    };

    const handleDateClick = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (isDateAvailable(date)) {
            onDateSelect(date);
            onTimeSelect(''); // Reset time when date changes
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getTimeSlotsForSelectedDate = (): Array<{ time: string; available: boolean }> => {
        if (!selectedDate) return [];

        const dateKey = formatDateKey(selectedDate);
        const slots = availableSlots[dateKey] || [];

        // Generate time slots (9:00 - 18:00, every 30 minutes)
        const allSlots: string[] = [];
        for (let hour = 9; hour < 18; hour++) {
            allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }

        return allSlots.map((time) => ({
            time,
            available: slots.includes(time),
        }));
    };

    // Generate calendar days
    const calendarDays: (number | null)[] = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <div className="space-y-6">
            {/* Calendar */}
            <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => navigateMonth('prev')}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <h3 className="text-lg font-semibold">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => navigateMonth('next')}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day, index) => (
                            <div
                                key={index}
                                className="text-center text-sm font-medium text-muted-foreground py-2"
                            >
                                {day.substring(0, 2)}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={index} className="aspect-square" />;
                            }

                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            const available = isDateAvailable(date);
                            const selected = isDateSelected(date);

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleDateClick(day)}
                                    disabled={!available}
                                    className={cn(
                                        "aspect-square rounded-md text-sm font-medium transition-all",
                                        "border border-input",
                                        available
                                            ? "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                            : "opacity-30 cursor-not-allowed bg-muted",
                                        selected && available
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background"
                                    )}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Time Slots */}
            {selectedDate && (
                <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {t('wills.datetime.selectTime')}
                        </h3>
                        <TimeSlotSelector
                            slots={getTimeSlotsForSelectedDate()}
                            selectedTime={selectedTime}
                            onSelectTime={onTimeSelect}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

