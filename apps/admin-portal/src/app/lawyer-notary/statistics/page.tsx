'use client';

import { ExportButton } from '@/components/shared/ExportButton';
import { LicenseTypeBadge } from '@/components/shared/LicenseTypeBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/Card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LawyerNotaryProfile, lawyerNotaryApi } from '@/lib/api/lawyer-notary';
import { exportLawyersToCSV } from '@/lib/utils/export';
import { useTranslations } from '@/lib/i18n';
import { ArrowLeft, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LawyerStatistics {
  lawyer: LawyerNotaryProfile;
  appointmentsCount: number;
  completedWillsCount: number;
  averageRating?: number;
  confirmationRate?: number;
}

export default function LawyerStatisticsPage() {
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');
  const { error, handleError, clearError } = useErrorHandler();
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<LawyerStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'appointments' | 'completed' | 'rating'>('appointments');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      clearError();
      const data = await lawyerNotaryApi.getAll();
      setLawyers(data);

      // Generate statistics (in a real application this would come from API)
      // TODO: Replace with actual API call to get statistics from database
      const stats: LawyerStatistics[] = data.map((lawyer: any) => ({
        lawyer,
        appointmentsCount: 0, // TODO: Get from database
        completedWillsCount: 0, // TODO: Get from database
        averageRating: lawyer.rating || 0, // Use actual rating from profile
        confirmationRate: 0, // TODO: Get from database
      }));

      setStatistics(stats);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedStatistics = [...statistics].sort((a, b) => {
    switch (sortBy) {
      case 'appointments':
        return b.appointmentsCount - a.appointmentsCount;
      case 'completed':
        return b.completedWillsCount - a.completedWillsCount;
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lawyer-notary">
          <button className="p-2 hover:bg-gray-100 rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} onRetry={loadData} showRetry={true} />
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('appointments')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  sortBy === 'appointments'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('byAppointments')}
              </button>
              <button
                onClick={() => setSortBy('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  sortBy === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('byCompleted')}
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  sortBy === 'rating'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('byRating')}
              </button>
            </div>
            <ExportButton
              onExport={() => exportLawyersToCSV(lawyers)}
              disabled={lawyers.length === 0}
              label={t('exportToCSV')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sortedStatistics.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">{t('noData')}</p>
            </CardContent>
          </Card>
        ) : (
          sortedStatistics.map(stat => (
            <Card key={stat.lawyer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {stat.lawyer.user?.email || 'N/A'}
                      </h3>
                      <StatusBadge status={stat.lawyer.status} />
                      <LicenseTypeBadge licenseType={stat.lawyer.licenseType} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-500">{t('appointments')}</p>
                          <p className="text-lg font-semibold">{stat.appointmentsCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500">{t('completed')}</p>
                          <p className="text-lg font-semibold">{stat.completedWillsCount}</p>
                        </div>
                      </div>
                      {stat.averageRating && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-yellow-500" />
                          <div>
                            <p className="text-sm text-gray-500">{t('rating')}</p>
                            <p className="text-lg font-semibold">
                              {stat.averageRating.toFixed(1)}/5
                            </p>
                          </div>
                        </div>
                      )}
                      {stat.confirmationRate && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-500">{t('confirmed')}</p>
                            <p className="text-lg font-semibold">
                              {stat.confirmationRate.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link href={`/lawyer-notary/${stat.lawyer.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        {t('details')}
                      </button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
