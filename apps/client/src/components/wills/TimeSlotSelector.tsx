'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface TimeSlot {
    time: string; // Format: "HH:MM"
    available: boolean;
}

interface TimeSlotSelectorProps {
    slots: TimeSlot[];
    selectedTime: string | null;
    onSelectTime: (time: string) => void;
    className?: string;
}

export function TimeSlotSelector({ slots, selectedTime, onSelectTime, className }: TimeSlotSelectorProps) {
    if (slots.length === 0) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <p>No available time slots</p>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2", className)}>
            {slots.map((slot) => (
                <button
                    key={slot.time}
                    type="button"
                    onClick={() => slot.available && onSelectTime(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        "border border-input bg-background",
                        slot.available
                            ? "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            : "opacity-50 cursor-not-allowed bg-muted",
                        selectedTime === slot.time && slot.available
                            ? "bg-primary text-primary-foreground border-primary"
                            : ""
                    )}
                >
                    {slot.time}
                </button>
            ))}
        </div>
    );
}



