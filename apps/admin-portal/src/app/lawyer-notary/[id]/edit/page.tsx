'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lawyerNotaryApi, UpdateLawyerNotaryDto, LicenseType } from '@/lib/api/lawyer-notary';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditLawyerNotaryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { error, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateLawyerNotaryDto>({});

  useEffect(() => {
    if (id) {
      loadLawyer();
    }
  }, [id]);

  const loadLawyer = async () => {
    try {
      setLoading(true);
      clearError();
      const data = await lawyerNotaryApi.getOne(id);
      setFormData({
        licenseNumber: data.licenseNumber,
        licenseType: data.licenseType,
        organization: data.organization,
        specialization: data.specialization,
        yearsOfExperience: data.yearsOfExperience,
        officePostalCode: data.officePostalCode,
        officeAddress: data.officeAddress,
        phone: data.phone,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      clearError();
      await lawyerNotaryApi.update(id, formData);
      router.push(`/lawyer-notary/${id}`);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/lawyer-notary/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Редактировать профиль</h1>
      </div>

      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} onRetry={loadLawyer} showRetry={true} />
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер лицензии *
                </label>
                <Input
                  required
                  value={formData.licenseNumber || ''}
                  onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="Номер лицензии"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип лицензии *
                </label>
                <select
                  required
                  value={formData.licenseType || 'LAWYER'}
                  onChange={e =>
                    setFormData({ ...formData, licenseType: e.target.value as LicenseType })
                  }
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Организация</label>
                <Input
                  value={formData.organization || ''}
                  onChange={e => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Название организации"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Специализация
                </label>
                <Input
                  value={formData.specialization || ''}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Специализация"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Годы опыта</label>
              <Input
                type="number"
                value={formData.yearsOfExperience || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Годы опыта"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Почтовый индекс офиса *
              </label>
              <Input
                required
                value={formData.officePostalCode || ''}
                onChange={e => setFormData({ ...formData, officePostalCode: e.target.value })}
                placeholder="Почтовый индекс"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Полный адрес офиса *
              </label>
              <Input
                required
                value={formData.officeAddress || ''}
                onChange={e => setFormData({ ...formData, officeAddress: e.target.value })}
                placeholder="Полный адрес офиса"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <Input
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Телефон"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Link href={`/lawyer-notary/${id}`}>
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
