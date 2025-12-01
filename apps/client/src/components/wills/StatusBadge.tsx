'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const { t } = useLanguage();

    const statusConfig = {
        PENDING: {
            label: t('wills.appointments.status.pending'),
            className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        },
        CONFIRMED: {
            label: t('wills.appointments.status.confirmed'),
            className: 'bg-blue-100 text-blue-800 border-blue-300',
        },
        COMPLETED: {
            label: t('wills.appointments.status.completed'),
            className: 'bg-green-100 text-green-800 border-green-300',
        },
        CANCELLED: {
            label: t('wills.appointments.status.cancelled'),
            className: 'bg-red-100 text-red-800 border-red-300',
        },
    };

    const config = statusConfig[status];

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                config.className,
                className
            )}
        >
            {config.label}
        </span>
    );
}



