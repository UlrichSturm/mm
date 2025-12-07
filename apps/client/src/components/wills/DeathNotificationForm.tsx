'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Upload } from 'lucide-react';

interface DeathNotificationFormProps {
  onSubmit: (data: {
    clientName?: string;
    appointmentNumber?: string;
    deathDate: string;
    deathCertificate?: File;
    notifierContact: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function DeathNotificationForm({ onSubmit, loading }: DeathNotificationFormProps) {
  const { t } = useLanguage();
  const [searchType, setSearchType] = useState<'name' | 'appointment'>('name');
  const [clientName, setClientName] = useState('');
  const [appointmentNumber, setAppointmentNumber] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathCertificate, setDeathCertificate] = useState<File | null>(null);
  const [notifierContact, setNotifierContact] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        setError(t('wills.deathNotification.invalidFileType'));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('wills.deathNotification.fileTooLarge'));
        return;
      }
      setDeathCertificate(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (searchType === 'name' && !clientName.trim()) {
      setError(t('wills.deathNotification.clientNameRequired'));
      return;
    }

    if (searchType === 'appointment' && !appointmentNumber.trim()) {
      setError(t('wills.deathNotification.appointmentNumberRequired'));
      return;
    }

    if (!deathDate) {
      setError(t('wills.deathNotification.deathDateRequired'));
      return;
    }

    if (!notifierContact.trim()) {
      setError(t('wills.deathNotification.contactRequired'));
      return;
    }

    try {
      await onSubmit({
        clientName: searchType === 'name' ? clientName : undefined,
        appointmentNumber: searchType === 'appointment' ? appointmentNumber : undefined,
        deathDate,
        deathCertificate: deathCertificate || undefined,
        notifierContact,
      });
    } catch (err) {
      console.error('Failed to submit death notification:', err);
      setError(t('wills.deathNotification.submitError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Type Selection */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('wills.deathNotification.search.title')}
          </h3>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setSearchType('name');
                setClientName('');
                setAppointmentNumber('');
              }}
              className={`flex-1 px-4 py-2 rounded-md border transition-all ${
                searchType === 'name'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent'
              }`}
            >
              {t('wills.deathNotification.search.byName')}
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType('appointment');
                setClientName('');
                setAppointmentNumber('');
              }}
              className={`flex-1 px-4 py-2 rounded-md border transition-all ${
                searchType === 'appointment'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent'
              }`}
            >
              {t('wills.deathNotification.search.byAppointment')}
            </button>
          </div>

          {searchType === 'name' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('wills.deathNotification.clientName')}
              </label>
              <Input
                type="text"
                placeholder={t('wills.deathNotification.clientNamePlaceholder')}
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="h-12"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('wills.deathNotification.appointmentNumber')}
              </label>
              <Input
                type="text"
                placeholder={t('wills.deathNotification.appointmentNumberPlaceholder')}
                value={appointmentNumber}
                onChange={e => setAppointmentNumber(e.target.value)}
                className="h-12"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Death Information */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('wills.deathNotification.deathInfo.title')}
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('wills.deathNotification.deathDate')}
              </label>
              <Input
                type="date"
                value={deathDate}
                onChange={e => setDeathDate(e.target.value)}
                className="h-12"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('wills.deathNotification.deathCertificate')}
              </label>
              <div className="border-2 border-dashed border-input rounded-md p-6 text-center">
                <input
                  type="file"
                  id="death-certificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="death-certificate"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {deathCertificate
                      ? deathCertificate.name
                      : t('wills.deathNotification.uploadCertificate')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('wills.deathNotification.fileRequirements')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifier Contact */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('wills.deathNotification.notifier.title')}
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('wills.deathNotification.notifierContact')}
              </label>
              <Input
                type="text"
                placeholder={t('wills.deathNotification.notifierContactPlaceholder')}
                value={notifierContact}
                onChange={e => setNotifierContact(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                {t('wills.deathNotification.notifierContactHint')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('common.loading') : t('wills.deathNotification.submit')}
      </Button>
    </form>
  );
}
