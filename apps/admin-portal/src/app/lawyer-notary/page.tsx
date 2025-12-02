'use client';

import { useEffect, useState } from 'react';
import {
  lawyerNotaryApi,
  LawyerNotaryProfile,
  LawyerNotaryFilters,
  LawyerNotaryStatus,
  LicenseType,
} from '@/lib/api/lawyer-notary';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LicenseTypeBadge } from '@/components/shared/LicenseTypeBadge';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';
import { Search, Plus, Eye } from 'lucide-react';
import { exportLawyersToCSV } from '@/lib/utils/export';
import { ExportButton } from '@/components/shared/ExportButton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function LawyerNotaryListPage() {
  const t = useTranslations('lawyers');
  const tCommon = useTranslations('common');
  const { error, handleError, clearError } = useErrorHandler();
  const [lawyers, setLawyers] = useState<LawyerNotaryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LawyerNotaryFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLawyers();
  }, [filters]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      clearError();
      const data = await lawyerNotaryApi.getAll(filters);
      setLawyers(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery || undefined }));
  };

  const handleStatusFilter = (status?: LawyerNotaryStatus) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleLicenseTypeFilter = (licenseType?: LicenseType) => {
    setFilters(prev => ({ ...prev, licenseType }));
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
        <div className="flex gap-2">
          <ExportButton
            onExport={() => exportLawyersToCSV(lawyers)}
            disabled={lawyers.length === 0}
          />
          <Link href="/lawyer-notary/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} onRetry={loadLawyers} showRetry={true} />
      )}

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSearch}>{tCommon('search')}</Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filters.status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter(undefined)}
              >
                {t('allStatuses')}
              </Button>
              <Button
                variant={filters.status === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('PENDING')}
              >
                {tCommon('pending')}
              </Button>
              <Button
                variant={filters.status === 'APPROVED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('APPROVED')}
              >
                {tCommon('approved')}
              </Button>
              <Button
                variant={filters.status === 'REJECTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('REJECTED')}
              >
                {tCommon('rejected')}
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filters.licenseType ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLicenseTypeFilter(undefined)}
              >
                {t('allTypes')}
              </Button>
              <Button
                variant={filters.licenseType === 'LAWYER' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLicenseTypeFilter('LAWYER')}
              >
                Lawyer
              </Button>
              <Button
                variant={filters.licenseType === 'NOTARY' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLicenseTypeFilter('NOTARY')}
              >
                Notary
              </Button>
              <Button
                variant={filters.licenseType === 'BOTH' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLicenseTypeFilter('BOTH')}
              >
                Both
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {lawyers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">{t('noLawyers')}</p>
            </CardContent>
          </Card>
        ) : (
          lawyers.map(lawyer => (
            <Card key={lawyer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lawyer.user?.email || 'N/A'}
                      </h3>
                      <StatusBadge status={lawyer.status} />
                      <LicenseTypeBadge licenseType={lawyer.licenseType} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{t('licenseNumber')}:</span>{' '}
                        {lawyer.licenseNumber}
                      </div>
                      <div>
                        <span className="font-medium">Postal Code:</span> {lawyer.officePostalCode}
                      </div>
                      {lawyer.organization && (
                        <div>
                          <span className="font-medium">{t('businessName')}:</span>{' '}
                          {lawyer.organization}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(lawyer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link href={`/lawyer-notary/${lawyer.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        {tCommon('view')}
                      </Button>
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
