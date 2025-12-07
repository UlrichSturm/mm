'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

export function DocumentUpload() {
  const [willDocument, setWillDocument] = useState<File | null>(null);
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);

  const handleWillDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWillDocument(e.target.files[0]);
    }
  };

  const handleAdditionalDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalDocuments(Array.from(e.target.files));
    }
  };

  const removeWillDocument = () => {
    setWillDocument(null);
  };

  const removeAdditionalDocument = (index: number) => {
    setAdditionalDocuments(additionalDocuments.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Документы</CardTitle>
        <CardDescription>Загрузка документов (опционально)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="willDocument" className="block text-sm font-medium mb-1">
            Скан завещания
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="willDocument"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleWillDocumentChange}
              className="flex-1"
            />
            {willDocument && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{willDocument.name}</span>
                <Button type="button" variant="ghost" size="icon" onClick={removeWillDocument}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="additionalDocuments" className="block text-sm font-medium mb-1">
            Дополнительные документы
          </label>
          <Input
            id="additionalDocuments"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleAdditionalDocumentsChange}
          />
          {additionalDocuments.length > 0 && (
            <div className="mt-2 space-y-1">
              {additionalDocuments.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{doc.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAdditionalDocument(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
