'use client';

import { useState, FormEvent } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Lock, CreditCard } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripePaymentForm({
  amount,
  currency = 'EUR',
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment form validation failed');
        onError?.(submitError.message || 'Payment form validation failed');
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        onError?.(confirmError.message || 'Payment failed');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('payments.title')}</h3>
          </div>

          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('payments.amount')}:</span>
              <span className="text-xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency.toUpperCase(),
                }).format(amount / 100)}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <PaymentElement
              options={{
                layout: 'tabs',
              }}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
            <Lock className="h-4 w-4" />
            <span>{t('payments.secure')}</span>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={!stripe || isProcessing} className="w-full" size="lg">
        {isProcessing ? t('common.loading') : t('payments.submit')}
      </Button>
    </form>
  );
}
