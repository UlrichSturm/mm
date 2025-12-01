'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lawyerNotaryApi, LawyerNotaryProfile, LawyerNotaryStatus } from '@/lib/api/lawyer-notary';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LicenseTypeBadge } from '@/components/shared/LicenseTypeBadge';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function LawyerNotaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { error, handleError, clearError } = useErrorHandler();
  const [lawyer, setLawyer] = useState<LawyerNotaryProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLawyer(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: LawyerNotaryStatus) => {
    if (!confirm(`Изменить статус на "${newStatus}"?`)) return;
    
    try {
      clearError();
      await lawyerNotaryApi.updateStatus(id, newStatus);
      loadLawyer();
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот профиль?')) return;
    
    try {
      clearError();
      await lawyerNotaryApi.delete(id);
      router.push('/lawyer-notary');
    } catch (err) {
      handleError(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!lawyer && !error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Профиль не найден</p>
        <Link href="/lawyer-notary">
          <Button className="mt-4">Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          onRetry={loadLawyer}
          showRetry={true}
        />
      )}

      {!lawyer && error && (
        <div className="text-center py-12">
          <Link href="/lawyer-notary">
            <Button className="mt-4">Вернуться к списку</Button>
          </Link>
        </div>
      )}

      {lawyer && (
        <>
          <div className="flex items-center gap-4">
        <Link href="/lawyer-notary">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Профиль адвоката/нотариуса</h1>
      </div>

      <div className="flex gap-4">
        <Link href={`/lawyer-notary/${id}/edit`}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        </Link>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Удалить
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Данные пользователя</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{lawyer.user?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Статус:</span>
                <div className="mt-1">
                  <StatusBadge status={lawyer.status} />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Создан:</span>
                <p className="text-gray-900">
                  {new Date(lawyer.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Профессиональная информация</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Тип лицензии:</span>
                <div className="mt-1">
                  <LicenseTypeBadge licenseType={lawyer.licenseType} />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Номер лицензии:</span>
                <p className="text-gray-900">{lawyer.licenseNumber}</p>
              </div>
              {lawyer.organization && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Организация:</span>
                  <p className="text-gray-900">{lawyer.organization}</p>
                </div>
              )}
              {lawyer.specialization && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Специализация:</span>
                  <p className="text-gray-900">{lawyer.specialization}</p>
                </div>
              )}
              {lawyer.yearsOfExperience && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Годы опыта:</span>
                  <p className="text-gray-900">{lawyer.yearsOfExperience}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Контактная информация</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Почтовый индекс:</span>
                <p className="text-gray-900">{lawyer.officePostalCode}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Адрес офиса:</span>
                <p className="text-gray-900">{lawyer.officeAddress}</p>
              </div>
              {lawyer.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Телефон:</span>
                  <p className="text-gray-900">{lawyer.phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Изменение статуса</h2>
            <div className="space-y-2">
              {lawyer.status !== 'APPROVED' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('APPROVED')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Одобрить
                </Button>
              )}
              {lawyer.status !== 'REJECTED' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('REJECTED')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Отклонить
                </Button>
              )}
              {lawyer.status !== 'PENDING' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('PENDING')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Вернуть на рассмотрение
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}

