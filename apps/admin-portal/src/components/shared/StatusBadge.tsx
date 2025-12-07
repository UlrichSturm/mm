'use client';

import { cn } from "@/lib/utils";
import { LawyerNotaryStatus } from "@/lib/api/lawyer-notary";
import { VendorStatus } from "@/lib/api/vendors";
import { useTranslations } from "@/lib/i18n";

type Status = LawyerNotaryStatus | VendorStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { className: string }> = {
  PENDING: {
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  APPROVED: {
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations('status');
  const config = statusConfig[status];

  const label = t(status.toLowerCase() as 'pending' | 'approved' | 'rejected');

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {label}
    </span>
  );
}

