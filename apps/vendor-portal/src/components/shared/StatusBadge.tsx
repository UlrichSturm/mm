'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Ожидает подтверждения', className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Подтверждена', className: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'В процессе', className: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: 'Завершена', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Отменена', className: 'bg-red-100 text-red-800' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}



