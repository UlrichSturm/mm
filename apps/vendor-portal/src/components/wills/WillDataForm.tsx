'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RelativesForm } from './RelativesForm';
import { BeneficiariesForm } from './BeneficiariesForm';
import { DocumentUpload } from './DocumentUpload';

interface WillDataFormProps {
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export function WillDataForm({ onSave, saving }: WillDataFormProps) {
  const [clientData, setClientData] = useState({
    fullName: '',
    dateOfBirth: '',
    passportData: '',
    address: '',
    phone: '',
    email: '',
  });

  const [relatives, setRelatives] = useState<
    Array<{
      name: string;
      relationship: string;
      phone: string;
      email: string;
    }>
  >([]);

  const [beneficiaries, setBeneficiaries] = useState<
    Array<{
      name: string;
      relationship: string;
      share: string;
    }>
  >([]);

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [willNumber, setWillNumber] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !clientData.fullName ||
      !clientData.dateOfBirth ||
      !clientData.passportData ||
      !clientData.address ||
      !clientData.phone ||
      !clientData.email
    ) {
      alert('Пожалуйста, заполните все обязательные поля данных клиента');
      return;
    }

    await onSave({
      clientData,
      relatives: relatives.length > 0 ? relatives : undefined,
      beneficiaries: beneficiaries.length > 0 ? beneficiaries : undefined,
      specialInstructions: specialInstructions || undefined,
      willNumber: willNumber || undefined,
      registrationDate: registrationDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Data */}
      <Card>
        <CardHeader>
          <CardTitle>Данные клиента *</CardTitle>
          <CardDescription>Обязательная информация о клиенте</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              ФИО *
            </label>
            <Input
              id="fullName"
              value={clientData.fullName}
              onChange={e => setClientData({ ...clientData, fullName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
              Дата рождения *
            </label>
            <Input
              id="dateOfBirth"
              type="date"
              value={clientData.dateOfBirth}
              onChange={e => setClientData({ ...clientData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="passportData" className="block text-sm font-medium mb-1">
              Паспортные данные *
            </label>
            <Input
              id="passportData"
              value={clientData.passportData}
              onChange={e => setClientData({ ...clientData, passportData: e.target.value })}
              placeholder="Серия и номер паспорта"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Адрес проживания *
            </label>
            <Input
              id="address"
              value={clientData.address}
              onChange={e => setClientData({ ...clientData, address: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Телефон *
            </label>
            <Input
              id="phone"
              type="tel"
              value={clientData.phone}
              onChange={e => setClientData({ ...clientData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              value={clientData.email}
              onChange={e => setClientData({ ...clientData, email: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Relatives */}
      <RelativesForm relatives={relatives} onChange={setRelatives} />

      {/* Beneficiaries */}
      <BeneficiariesForm beneficiaries={beneficiaries} onChange={setBeneficiaries} />

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium mb-1">
              Специальные указания
            </label>
            <textarea
              id="specialInstructions"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Юридическая информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="willNumber" className="block text-sm font-medium mb-1">
              Номер завещания в реестре
            </label>
            <Input
              id="willNumber"
              value={willNumber}
              onChange={e => setWillNumber(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="registrationDate" className="block text-sm font-medium mb-1">
              Дата регистрации
            </label>
            <Input
              id="registrationDate"
              type="date"
              value={registrationDate}
              onChange={e => setRegistrationDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <DocumentUpload />

      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Сохранение...' : 'Завершить и сохранить'}
        </Button>
      </div>
    </form>
  );
}
