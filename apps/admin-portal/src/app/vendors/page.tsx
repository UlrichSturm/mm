'use client';

import { useEffect, useState } from 'react';
import { vendorsApi, VendorProfile, VendorFilters, VendorStatus } from '@/lib/api/vendors';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function VendorsPage() {
  const t = useTranslations('vendors');
  const tCommon = useTranslations('common');
  const { error, handleError, clearError } = useErrorHandler();
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VendorFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVendors();
  }, [filters]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      clearError();
      let data = await vendorsApi.getAll(filters);
      
      // Apply search filter on client side
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter(
          (v) =>
            v.businessName.toLowerCase().includes(query) ||
            v.email.toLowerCase().includes(query)
        );
      }
      
      setVendors(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadVendors();
  };

  const handleStatusFilter = (status?: VendorStatus) => {
    setFilters(prev => ({ ...prev, status }));
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
        <Link href="/vendors/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        </Link>
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          variant="error"
        />
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value as VendorStatus || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('allStatuses')}</option>
                <option value="PENDING">{tCommon('pending')}</option>
                <option value="APPROVED">{tCommon('approved')}</option>
                <option value="REJECTED">{tCommon('rejected')}</option>
              </select>
              <Button onClick={handleSearch} variant="outline">
                <Search className="w-4 h-4 mr-2" />
                {tCommon('search')}
              </Button>
            </div>
          </div>

          {vendors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('noVendors')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('businessName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tCommon('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registrationDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tCommon('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.businessName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{vendor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={vendor.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(vendor.registrationDate).toLocaleDateString('ru-RU')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {tCommon('view')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

