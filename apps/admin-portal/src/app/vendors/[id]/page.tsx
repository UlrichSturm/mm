'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vendorsApi, VendorProfile, VendorStatus } from '@/lib/api/vendors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock, Mail, Phone, MapPin } from 'lucide-react';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { error, handleError, clearError } = useErrorHandler();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('vendors');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (id) {
      loadVendor();
    }
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      clearError();
      const data = await vendorsApi.getById(id);
      setVendor(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: VendorStatus) => {
    if (!confirm(`Change status to "${newStatus}"?`)) {
      return;
    }

    try {
      clearError();
      await vendorsApi.updateStatus(id, newStatus);
      loadVendor();
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      clearError();
      await vendorsApi.delete(id);
      router.push('/vendors');
    } catch (err) {
      handleError(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{tCommon('loading')}</div>
      </div>
    );
  }

  if (!vendor && !error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('vendorNotFound')}</p>
        <Link href="/vendors">
          <Button className="mt-4">{t('backToList')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} onRetry={loadVendor} showRetry={true} />
      )}

      {!vendor && error && (
        <div className="text-center py-12">
          <Link href="/vendors">
            <Button className="mt-4">{t('backToList')}</Button>
          </Link>
        </div>
      )}

      {vendor && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/vendors">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{vendor.businessName}</h1>
                <p className="text-sm text-gray-500 mt-1">{vendor.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/vendors/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  {tCommon('edit')}
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                {tCommon('delete')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('vendorInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('businessName')}</label>
                    <p className="mt-1 text-sm text-gray-900">{vendor.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('email')}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{vendor.email}</p>
                    </div>
                  </div>
                  {vendor.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">{tCommon('phone')}</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{vendor.phone}</p>
                      </div>
                    </div>
                  )}
                  {vendor.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">{tCommon('address')}</label>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{vendor.address}</p>
                      </div>
                    </div>
                  )}
                  {vendor.postalCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">{tCommon('postalCode')}</label>
                      <p className="mt-1 text-sm text-gray-900">{vendor.postalCode}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{tCommon('status')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={vendor.status} />
                  </div>
                  <div className="space-y-2">
                    {vendor.status !== 'APPROVED' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleStatusChange('APPROVED')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {tCommon('approve')}
                      </Button>
                    )}
                    {vendor.status !== 'REJECTED' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleStatusChange('REJECTED')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {tCommon('reject')}
                      </Button>
                    )}
                    {vendor.status !== 'PENDING' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleStatusChange('PENDING')}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {tCommon('setPending')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('additionalInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('userId')}</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{vendor.userId}</p>
                    <p className="mt-1 text-xs text-gray-500">{t('userIdDescription')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('registrationDate')}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(vendor.registrationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{tCommon('createdAt')}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(vendor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

