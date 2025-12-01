'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { lawyerNotaryApi, CreateLawyerNotaryDto, LicenseType } from '@/lib/api/lawyer-notary';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateLawyerNotaryPage() {
  const router = useRouter();
  const { error, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLawyerNotaryDto>({
    userId: '',
    licenseNumber: '',
    licenseType: 'LAWYER',
    organization: '',
    specialization: '',
    yearsOfExperience: undefined,
    officePostalCode: '',
    officeAddress: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      setLoading(true);
      const created = await lawyerNotaryApi.create(formData);
      router.push(`/lawyer-notary/${created.id}`);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lawyer-notary">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Создать профиль адвоката/нотариуса</h1>
      </div>

      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} showRetry={false} />
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID пользователя *
              </label>
              <Input
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="Введите ID пользователя"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер лицензии *
                </label>
                <Input
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="Номер лицензии"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип лицензии *
                </label>
                <select
                  required
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as LicenseType })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="LAWYER">Адвокат</option>
                  <option value="NOTARY">Нотариус</option>
                  <option value="BOTH">Оба</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Организация
                </label>
                <Input
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Название организации"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Специализация
                </label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Специализация"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Годы опыта
              </label>
              <Input
                type="number"
                value={formData.yearsOfExperience || ''}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Годы опыта"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Почтовый индекс офиса *
              </label>
              <Input
                required
                value={formData.officePostalCode}
                onChange={(e) => setFormData({ ...formData, officePostalCode: e.target.value })}
                placeholder="Почтовый индекс"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Полный адрес офиса *
              </label>
              <Input
                required
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                placeholder="Полный адрес офиса"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Телефон"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Создание...' : 'Создать профиль'}
              </Button>
              <Link href="/lawyer-notary">
                <Button type="button" variant="outline">
                  Отмена
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

