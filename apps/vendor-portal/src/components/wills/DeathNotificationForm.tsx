'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface DeathNotificationFormProps {
  client: any;
  onNotify: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function DeathNotificationForm({ client, onNotify, onCancel }: DeathNotificationFormProps) {
  const [deathDate, setDeathDate] = useState('');
  const [deathCertificate, setDeathCertificate] = useState<File | null>(null);
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
  const [notifierContact, setNotifierContact] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deathDate || !deathCertificate || !notifierContact) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setSaving(true);
      await onNotify({
        clientId: client.id,
        appointmentId: client.appointmentId,
        deathDate,
        deathCertificate,
        additionalDocuments: additionalDocuments.length > 0 ? additionalDocuments : undefined,
        notifierContact,
      });
    } catch (error) {
      console.error('Failed to notify:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Уведомление о смерти</CardTitle>
            <CardDescription>
              Клиент: {client.clientName || 'Не указано'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="deathDate" className="block text-sm font-medium mb-1">
              Дата смерти *
            </label>
            <Input
              id="deathDate"
              type="date"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="deathCertificate" className="block text-sm font-medium mb-1">
              Справка о смерти *
            </label>
            <Input
              id="deathCertificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDeathCertificate(e.target.files[0]);
                }
              }}
              required
            />
            {deathCertificate && (
              <p className="text-sm text-muted-foreground mt-1">
                Выбран файл: {deathCertificate.name}
              </p>
            )}
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
              onChange={(e) => {
                if (e.target.files) {
                  setAdditionalDocuments(Array.from(e.target.files));
                }
              }}
            />
            {additionalDocuments.length > 0 && (
              <div className="mt-2 space-y-1">
                {additionalDocuments.map((doc, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {doc.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notifierContact" className="block text-sm font-medium mb-1">
              Контактная информация уведомителя *
            </label>
            <Input
              id="notifierContact"
              value={notifierContact}
              onChange={(e) => setNotifierContact(e.target.value)}
              placeholder="Телефон или email"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Отправка...' : 'Отправить уведомление'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}



