import { cn } from "@/lib/utils";
import { LawyerNotaryStatus } from "@/lib/api/lawyer-notary";

interface StatusBadgeProps {
  status: LawyerNotaryStatus;
  className?: string;
}

const statusConfig: Record<LawyerNotaryStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Ожидает",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  APPROVED: {
    label: "Одобрен",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    label: "Отклонен",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

