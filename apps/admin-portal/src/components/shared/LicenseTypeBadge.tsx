'use client';

import { cn } from "@/lib/utils";
import { LicenseType } from "@/lib/api/lawyer-notary";
import { useTranslations } from "@/lib/i18n";

interface LicenseTypeBadgeProps {
  licenseType: LicenseType;
  className?: string;
}

const licenseConfig: Record<LicenseType, { className: string; key: string }> = {
  LAWYER: {
    className: "bg-blue-100 text-blue-800 border-blue-200",
    key: "lawyer",
  },
  NOTARY: {
    className: "bg-purple-100 text-purple-800 border-purple-200",
    key: "notary",
  },
  BOTH: {
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    key: "both",
  },
};

export function LicenseTypeBadge({ licenseType, className }: LicenseTypeBadgeProps) {
  const t = useTranslations('licenseType');
  const config = licenseConfig[licenseType];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {t(config.key as 'lawyer' | 'notary' | 'both')}
    </span>
  );
}

