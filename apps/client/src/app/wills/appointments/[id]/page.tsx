'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/wills/StatusBadge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { Calendar, Clock, User, Building2, Home, ArrowLeft, X, Phone, Mail } from 'lucide-react';

interface AppointmentDetails {
  id: string;
  lawyerName: string;
  lawyerContact?: {
    phone?: string;
    email?: string;
  };
  appointmentDate: string;
  location: 'office' | 'home';
  address: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  statusHistory?: Array<{
    status: string;
    date: string;
  }>;
  insurance?: {
    policyId: string;
    coverageAmount: number;
    monthlyPayment: number;
  };
}

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAppointment(appointmentId);
      // Transform API data
      const transformed: AppointmentDetails = {
        id: data.id,
        lawyerName: data.lawyer?.name || data.lawyerName || 'Unknown Lawyer',
        lawyerContact: data.lawyer?.contact || data.lawyerContact,
        appointmentDate: data.appointmentDate || data.date,
        location: data.location || 'office',
        address: data.address || data.clientAddress || 'N/A',
        status: data.status || 'PENDING',
        statusHistory: data.statusHistory || [],
        insurance: data.insurance,
      };
      setAppointment(transformed);
    } catch (err) {
      console.error('Failed to load appointment:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(t('wills.appointments.confirmCancel'))) {
      return;
    }

    setCancelling(true);
    try {
      await apiClient.cancelAppointment(appointmentId);
      router.push('/wills/my-appointments');
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      alert(t('wills.appointments.cancelError'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay
          error={error || new Error('Appointment not found')}
          onRetry={loadAppointment}
          title={t('wills.appointments.details.loadError')}
        />
      </div>
    );
  }

  const date = new Date(appointment.appointmentDate);
  const canCancel = appointment.status === 'PENDING';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/wills/my-appointments">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('wills.appointments.details.back')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-heading">
            {t('wills.appointments.details.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('wills.appointments.appointment')} #{appointment.id.substring(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={appointment.status} className="mt-4 sm:mt-0" />
      </div>

      <div className="space-y-6">
        {/* Appointment Information */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('wills.appointments.details.information')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('wills.appointments.details.lawyer')}
                  </p>
                  <p className="font-medium">{appointment.lawyerName}</p>
                  {appointment.lawyerContact && (
                    <div className="mt-2 space-y-1 text-sm">
                      {appointment.lawyerContact.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.lawyerContact.phone}</span>
                        </div>
                      )}
                      {appointment.lawyerContact.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{appointment.lawyerContact.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                {appointment.location === 'office' ? (
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                ) : (
                  <Home className="w-5 h-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {appointment.location === 'office'
                      ? t('wills.appointments.details.location.office')
                      : t('wills.appointments.details.location.home')}
                  </p>
                  <p className="font-medium">{appointment.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('wills.appointments.details.date')}
                  </p>
                  <p className="font-medium">{date.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('wills.appointments.details.time')}
                  </p>
                  <p className="font-medium">
                    {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status History */}
        {appointment.statusHistory && appointment.statusHistory.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t('wills.appointments.details.statusHistory')}
              </h2>
              <div className="space-y-3">
                {appointment.statusHistory.map((entry, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <StatusBadge status={entry.status as any} />
                    <span className="text-muted-foreground">
                      {new Date(entry.date).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insurance Information */}
        {appointment.insurance && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t('wills.appointments.details.insurance')}
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {t('wills.appointments.details.insurance.policyId')}:{' '}
                  </span>
                  <span className="font-medium">{appointment.insurance.policyId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('wills.appointments.details.insurance.coverage')}:{' '}
                  </span>
                  <span className="font-medium">
                    ${appointment.insurance.coverageAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('wills.appointments.details.insurance.monthlyPayment')}:{' '}
                  </span>
                  <span className="font-medium">
                    ${appointment.insurance.monthlyPayment.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {canCancel && (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-red-600 hover:text-red-700 hover:border-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              {cancelling ? t('common.loading') : t('wills.appointments.cancel')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
