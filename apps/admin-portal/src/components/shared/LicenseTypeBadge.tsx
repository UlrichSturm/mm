import { cn } from "@/lib/utils";
import { LicenseType } from "@/lib/api/lawyer-notary";

interface LicenseTypeBadgeProps {
  licenseType: LicenseType;
  className?: string;
}

const licenseConfig: Record<LicenseType, { label: string; className: string }> = {
  LAWYER: {
    label: "Адвокат",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  NOTARY: {
    label: "Нотариус",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  BOTH: {
    label: "Адвокат и Нотариус",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
};

export function LicenseTypeBadge({ licenseType, className }: LicenseTypeBadgeProps) {
  const config = licenseConfig[licenseType];
  
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

