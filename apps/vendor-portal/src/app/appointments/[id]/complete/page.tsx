'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { vendorApi } from '@/lib/api';
import { WillDataForm } from '@/components/wills/WillDataForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CompleteAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [saving, setSaving] = useState(false);

  const handleSave = async (willData: any) => {
    try {
      setSaving(true);
      await vendorApi.createWillData({
        appointmentId,
        ...willData,
      });
      await vendorApi.completeAppointment(appointmentId, {});
      router.push(`/appointments/${appointmentId}`);
    } catch (error) {
      console.error('Failed to save will data:', error);
      alert('Ошибка при сохранении данных завещания');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/appointments/${appointmentId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Внесение данных завещания</h1>
          <p className="text-muted-foreground">
            Заполните данные о завещании после встречи с клиентом
          </p>
        </div>
      </div>

      <WillDataForm onSave={handleSave} saving={saving} />
    </div>
  );
}
