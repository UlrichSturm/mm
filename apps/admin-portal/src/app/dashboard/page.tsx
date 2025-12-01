'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { lawyerNotaryApi, LawyerNotaryProfile } from '@/lib/api/lawyer-notary';
import { willsApi } from '@/lib/api/wills';
import { isAuthenticated } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, Clock, Calendar, FileText } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [lawyers, setLawyers] = useState<LawyerNotaryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    appointments: 0,
    executions: 0,
  });

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('auth_token');
    console.log('[Dashboard] Checking auth, token exists:', !!token, 'Length:', token?.length);
    
    if (!token) {
      console.log('[Dashboard] No token, redirecting to login');
      router.replace('/auth/login');
      return;
    }
    
    console.log('[Dashboard] Token found, loading data...');
    // Загружаем данные только если авторизованы
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    // Check token before making requests
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const [lawyersData, appointmentsData, executionsData] = await Promise.all([
        lawyerNotaryApi.getAll().catch((err) => {
          console.error('[Dashboard] Error loading lawyers:', err);
          return [];
        }),
        willsApi.getAllAppointments().catch((err) => {
          console.error('[Dashboard] Error loading appointments:', err);
          return [];
        }),
        willsApi.getAllExecutions().catch((err) => {
          console.error('[Dashboard] Error loading executions:', err);
          return [];
        }),
      ]);

      setLawyers(lawyersData);
      
      setStats({
        total: lawyersData.length,
        approved: lawyersData.filter(l => l.status === 'APPROVED').length,
        pending: lawyersData.filter(l => l.status === 'PENDING').length,
        rejected: lawyersData.filter(l => l.status === 'REJECTED').length,
        appointments: appointmentsData.length,
        executions: executionsData.length,
      });
    } catch (err: any) {
      setError(err.message || t('loadError'));
      console.error('[Dashboard] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <Link href="/lawyer-notary/create">
          <Button>{t('createProfile')}</Button>
        </Link>
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
          onRetry={loadData}
          showRetry={true}
        />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('totalLawyers')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('approved')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.approved}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('pending')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('rejected')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.rejected}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('willAppointments')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.appointments}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('willExecutions')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.executions}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {t('latestProfiles')}
          </h2>
          <div className="space-y-4">
            {lawyers.slice(0, 5).map((lawyer) => (
              <div
                key={lawyer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {lawyer.user?.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lawyer.licenseNumber} • {lawyer.officePostalCode}
                  </p>
                </div>
                <Link href={`/lawyer-notary/${lawyer.id}`}>
                  <Button variant="outline" size="sm">
                    {tCommon('view')}
                  </Button>
                </Link>
              </div>
            ))}
            {lawyers.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                {t('noProfiles')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

