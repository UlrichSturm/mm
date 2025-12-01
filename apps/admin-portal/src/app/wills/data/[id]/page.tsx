'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { willsApi, WillData } from '@/lib/api/wills';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Link from 'next/link';
import { ArrowLeft, Download, User, Phone, Mail, Calendar, FileText } from 'lucide-react';

export default function WillDataPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { error, handleError, clearError } = useErrorHandler();
  const [willData, setWillData] = useState<WillData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWillData();
    }
  }, [id]);

  const loadWillData = async () => {
    try {
      setLoading(true);
      clearError();
      const data = await willsApi.getWillData(id);
      setWillData(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, name: string) => {
    window.open(url, '_blank');
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
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          onRetry={loadWillData}
          showRetry={true}
        />
      )}

      {!willData && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">Данные завещания не найдены</p>
          <Link href="/wills/appointments">
            <Button className="mt-4">Вернуться к заявкам</Button>
          </Link>
        </div>
      )}

      {willData && (
        <>
          <div className="flex items-center gap-4">
        <Link href="/wills/appointments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Данные завещания</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Данные клиента
            </h2>
            <div className="space-y-3">
              {willData.clientData.firstName && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Имя:</span>
                  <p className="text-gray-900">{willData.clientData.firstName}</p>
                </div>
              )}
              {willData.clientData.lastName && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Фамилия:</span>
                  <p className="text-gray-900">{willData.clientData.lastName}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-gray-900">{willData.clientData.email}</p>
                </div>
              </div>
              {willData.clientData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Телефон:</span>
                    <p className="text-gray-900">{willData.clientData.phone}</p>
                  </div>
                </div>
              )}
              {willData.clientData.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Дата рождения:</span>
                    <p className="text-gray-900">
                      {new Date(willData.clientData.dateOfBirth).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {willData.relativesContacts && willData.relativesContacts.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Контакты родственников</h2>
              <div className="space-y-4">
                {willData.relativesContacts.map((relative, index) => (
                  <div key={index} className="border-b pb-3 last:border-0">
                    <p className="font-medium text-gray-900">{relative.name}</p>
                    <p className="text-sm text-gray-600">{relative.relationship}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {relative.phone}
                      </p>
                      {relative.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {relative.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {willData.heirs && willData.heirs.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Наследники</h2>
              <div className="space-y-3">
                {willData.heirs.map((heir, index) => (
                  <div key={index} className="border-b pb-3 last:border-0">
                    <p className="font-medium text-gray-900">{heir.name}</p>
                    <p className="text-sm text-gray-600">{heir.relationship}</p>
                    {heir.share && (
                      <p className="text-sm text-gray-600">Доля: {heir.share}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {willData.additionalInfo && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Дополнительная информация</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{willData.additionalInfo}</p>
            </CardContent>
          </Card>
        )}

        {willData.documents && willData.documents.length > 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Загруженные документы
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {willData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          Загружено: {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.url, doc.name)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Скачать
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>
          Создано: {new Date(willData.createdAt).toLocaleString('ru-RU')}
        </p>
        {willData.updatedAt !== willData.createdAt && (
          <p>
            Обновлено: {new Date(willData.updatedAt).toLocaleString('ru-RU')}
          </p>
        )}
      </div>
        </>
      )}
    </div>
  );
}

