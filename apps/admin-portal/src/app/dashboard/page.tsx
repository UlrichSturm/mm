'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { lawyerNotaryApi } from '@/lib/api/lawyer-notary';
import { vendorsApi } from '@/lib/api/vendors';
import { willsApi } from '@/lib/api/wills';
import { useTranslations } from '@/lib/i18n';
import { useKeycloak } from '@/components/auth/KeycloakProvider';
import { Calendar, CheckCircle, Clock, FileText, Users, XCircle, Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useKeycloak();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    appointments: 0,
    executions: 0,
    totalVendors: 0,
    approvedVendors: 0,
    pendingVendors: 0,
    rejectedVendors: 0,
  });

  useEffect(() => {
    // Проверяем авторизацию через Keycloak Provider
    if (isLoading) {
      return; // Ждем загрузки
    }

    if (!isAuthenticated) {
      console.log('[Dashboard] Not authenticated, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    console.log('[Dashboard] Authenticated, loading data...');
    // Загружаем данные только если авторизованы
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, router]);

  const loadData = async () => {
    // Проверяем авторизацию через Keycloak Provider
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [lawyersData, vendorsData, appointmentsData, executionsData] = await Promise.all([
        lawyerNotaryApi.getAll().catch(err => {
          console.error('[Dashboard] Error loading lawyers:', err);
          return [];
        }),
        vendorsApi.getAll().catch(err => {
          console.error('[Dashboard] Error loading vendors:', err);
          return [];
        }),
        willsApi.getAllAppointments().catch(err => {
          console.error('[Dashboard] Error loading appointments:', err);
          return [];
        }),
        willsApi.getAllExecutions().catch(err => {
          console.error('[Dashboard] Error loading executions:', err);
          return [];
        }),
      ]);

      setLawyers(lawyersData);
      setVendors(vendorsData);

      setStats({
        total: lawyersData.length,
        approved: lawyersData.filter(l => l.status === 'APPROVED').length,
        pending: lawyersData.filter(l => l.status === 'PENDING').length,
        rejected: lawyersData.filter(l => l.status === 'REJECTED').length,
        appointments: appointmentsData.length,
        executions: executionsData.length,
        totalVendors: vendorsData.length,
        approvedVendors: vendorsData.filter(v => v.status === 'APPROVED').length,
        pendingVendors: vendorsData.filter(v => v.status === 'PENDING').length,
        rejectedVendors: vendorsData.filter(v => v.status === 'REJECTED').length,
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
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('totalVendors')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalVendors}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('approved')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.approved + stats.approvedVendors}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('pending')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending + stats.pendingVendors}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('rejected')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.rejected + stats.rejectedVendors}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{stats.appointments}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{stats.executions}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">{t('latestLawyers')}</h2>
              <Link href="/lawyer-notary">
                <Button variant="outline" size="sm">
                  {tCommon('view')} All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {lawyers.slice(0, 5).map(lawyer => (
                <div
                  key={lawyer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lawyer.user?.email || 'N/A'}</p>
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
                <p className="text-center text-gray-500 py-8">{t('noLawyers')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">{t('latestVendors')}</h2>
              <Link href="/vendors">
                <Button variant="outline" size="sm">
                  {tCommon('view')} All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {vendors.slice(0, 5).map(vendor => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor.businessName}</p>
                    <p className="text-sm text-gray-500">
                      {vendor.email} • {vendor.status}
                    </p>
                  </div>
                  <Link href={`/vendors/${vendor.id}`}>
                    <Button variant="outline" size="sm">
                      {tCommon('view')}
                    </Button>
                  </Link>
                </div>
              ))}
              {vendors.length === 0 && (
                <p className="text-center text-gray-500 py-8">{t('noVendors')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
