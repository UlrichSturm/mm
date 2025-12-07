'use client';

import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
  label?: string;
}

export function ExportButton({ onExport, disabled = false, label }: ExportButtonProps) {
  const t = useTranslations('statistics');
  const buttonLabel = label || t('exportToCSV');

  return (
    <Button
      variant="outline"
      onClick={onExport}
      disabled={disabled}
    >
      <Download className="w-4 h-4 mr-2" />
      {buttonLabel}
    </Button>
  );
}



