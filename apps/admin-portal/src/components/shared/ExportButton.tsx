'use client';

import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
  label?: string;
}

export function ExportButton({ onExport, disabled = false, label = 'Экспорт в CSV' }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onExport}
      disabled={disabled}
    >
      <Download className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}



