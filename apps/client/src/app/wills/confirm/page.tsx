'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AppointmentSummary } from '@/components/wills/AppointmentSummary';
import { InsuranceOption } from '@/components/wills/InsuranceOption';
import { PaymentMethodSelector } from '@/components/wills/PaymentMethodSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function ConfirmAppointmentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Appointment data from localStorage
  const [appointmentData, setAppointmentData] = useState<{
    lawyerId: string;
    lawyerName: string;
    location: 'office' | 'home';
    address: string;
    date: Date;
    time: string;
  } | null>(null);

  // Form state
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [coverageAmount, setCoverageAmount] = useState<number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<
    'prepayment' | 'insurance' | 'relatives' | null
  >(null);

  useEffect(() => {
    loadAppointmentData();
  }, []);

  const loadAppointmentData = () => {
    const lawyerId = localStorage.getItem('selectedLawyerId');
    const location = localStorage.getItem('appointmentLocation') as 'office' | 'home' | null;
    const address = localStorage.getItem('clientAddress') || '';
    const dateTimeStr = localStorage.getItem('appointmentDateTime');

    if (!lawyerId || !location || !dateTimeStr) {
      router.push('/wills/select-lawyer');
      return;
    }

    const dateTime = new Date(dateTimeStr);
    const time = dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // TODO: Fetch lawyer name from API
    setAppointmentData({
      lawyerId,
      lawyerName: 'Lawyer Name', // Placeholder
      location,
      address: location === 'home' ? address : 'Lawyer Office Address', // Placeholder
      date: dateTime,
      time,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!appointmentData) {
      setError(t('wills.confirm.error.missingData'));
      return;
    }

    if (!paymentMethod) {
      setError(t('wills.confirm.error.paymentMethodRequired'));
      return;
    }

    if (insuranceSelected && paymentMethod === 'insurance' && !coverageAmount) {
      setError(t('wills.confirm.error.coverageRequired'));
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = appointmentData.time.split(':').map(Number);
      const appointmentDate = new Date(appointmentData.date);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Create appointment
      const appointment = await apiClient.createWillAppointment({
        lawyerId: appointmentData.lawyerId,
        appointmentDate: appointmentDate.toISOString(),
        location: appointmentData.location,
        clientAddress: appointmentData.location === 'home' ? appointmentData.address : undefined,
        insurance: insuranceSelected,
        paymentMethod,
      });

      // Create insurance policy if selected
      if (insuranceSelected && coverageAmount) {
        await apiClient.createInsurancePolicy({
          appointmentId: appointment.id,
          coverageAmount,
        });
      }

      // Save appointment ID for success page
      localStorage.setItem('lastAppointmentId', appointment.id);

      // Clear temporary data
      localStorage.removeItem('selectedLawyerId');
      localStorage.removeItem('appointmentLocation');
      localStorage.removeItem('clientAddress');
      localStorage.removeItem('appointmentDateTime');

      router.push('/wills/success');
    } catch (err) {
      console.error('Failed to create appointment:', err);
      setError(t('wills.confirm.error.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-heading">
        {t('wills.confirm.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-8">{t('wills.confirm.subtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appointment Summary */}
        <AppointmentSummary
          lawyerName={appointmentData.lawyerName}
          location={appointmentData.location}
          address={appointmentData.address}
          date={appointmentData.date}
          time={appointmentData.time}
        />

        {/* Terms and Conditions */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('wills.confirm.terms.title')}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{t('wills.confirm.terms.freeWill')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{t('wills.confirm.terms.funeralRights')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{t('wills.confirm.terms.documentStorage')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Insurance Option */}
        <InsuranceOption
          selected={insuranceSelected}
          onToggle={setInsuranceSelected}
          coverageAmount={coverageAmount}
          onCoverageChange={setCoverageAmount}
          monthlyPayment={coverageAmount ? coverageAmount / 120 : undefined} // Example calculation
        />

        {/* Payment Method */}
        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onSelect={setPaymentMethod}
          insuranceSelected={insuranceSelected}
        />

        {error && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            {t('common.back')}
          </Button>
          <Button type="submit" disabled={loading || !paymentMethod} className="flex-1">
            {loading ? t('common.loading') : t('wills.confirm.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}
