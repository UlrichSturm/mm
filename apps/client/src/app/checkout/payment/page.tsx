'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { apiClient } from '@/lib/api';
import { StripePaymentForm } from '@/components/payments/StripePaymentForm';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  items: Array<{
    id: string;
    service: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

export default function PaymentPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError(new Error('Order ID is required'));
      setLoading(false);
      return;
    }

    if (orderId) {
      loadOrderAndPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrderAndPaymentIntent = async () => {
    if (!orderId) {
      setError(new Error('Order ID is required'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load order
      const orderData = await apiClient.getOrder(orderId);
      setOrder(orderData);

      // Check if order is already paid
      if (orderData.status !== 'PENDING') {
        setError(new Error('Order is not in pending status'));
        setLoading(false);
        return;
      }

      // Create payment intent
      const returnUrl = `${window.location.origin}/payments/success`;
      const paymentIntent = await apiClient.createPaymentIntent(orderId, returnUrl);
      setClientSecret(paymentIntent.clientSecret);
      setPaymentIntentId(paymentIntent.paymentIntentId);
    } catch (err) {
      console.error('Failed to load order or create payment intent:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Redirect to success page
    router.push(`/payments/success?orderId=${orderId}&paymentIntentId=${paymentIntentId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <ErrorDisplay
          error={error || new Error('Order not found')}
          onRetry={loadOrderAndPaymentIntent}
          title={t('payments.errors.loadFailed')}
        />
        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{t('payments.errors.clientSecretFailed')}</p>
            <Button onClick={loadOrderAndPaymentIntent} className="mt-4">
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amountInCents = Math.round(Number(order.totalPrice) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/orders/${orderId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 gradient-heading">{t('payments.checkout.title')}</h1>
        <p className="text-muted-foreground">
          {t('payments.checkout.orderNumber')}: <strong>{order.orderNumber}</strong>
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">{t('payments.checkout.orderSummary')}</h2>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.service.name} × {item.quantity}
                  </span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(Number(item.price))}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between font-semibold">
                <span>{t('payments.checkout.total')}</span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(Number(order.totalPrice))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
          },
        }}
      >
        <StripePaymentForm
          amount={amountInCents}
          currency="EUR"
          onSuccess={handlePaymentSuccess}
          onError={errorMessage => setError(new Error(errorMessage))}
        />
      </Elements>
    </div>
  );
}
