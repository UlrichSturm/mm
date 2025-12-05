'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
}

interface Payment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paidAt?: string;
}

export default function PaymentSuccessPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('paymentIntentId');

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOrderAndPayment = async () => {
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

      // Try to find payment
      if (paymentIntentId) {
        try {
          const payments = await apiClient.getMyPayments();
          const foundPayment = payments.data?.find(
            (p: Payment) => p.id === paymentIntentId || orderId === orderData.id,
          );
          if (foundPayment) {
            setPayment(foundPayment);
          }
        } catch {
          // Payment might not be available yet, that's okay
        }
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderAndPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentIntentId]);

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
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">{t('payments.success.error.title')}</h1>
            <p className="text-muted-foreground mb-6">{error?.message || 'Order not found'}</p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/orders">{t('common.back')}</Link>
              </Button>
              <Button onClick={loadOrderAndPayment}>{t('common.retry')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = order.status !== 'PENDING' || payment?.status === 'COMPLETED';

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardContent className="p-12 text-center">
          {isPaid ? (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-3xl font-bold mb-2 gradient-heading">
                {t('payments.success.title')}
              </h1>
              <p className="text-muted-foreground mb-6">{t('payments.success.message')}</p>
            </>
          ) : (
            <>
              <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
              <h1 className="text-3xl font-bold mb-2 gradient-heading">
                {t('payments.success.processing')}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('payments.success.processingMessage')}
              </p>
            </>
          )}

          <div className="bg-muted rounded-lg p-6 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('payments.success.orderNumber')}:</span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('payments.success.amount')}:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(Number(order.totalPrice))}
                </span>
              </div>
              {payment?.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('payments.success.paidAt')}:</span>
                  <span className="font-semibold">{new Date(payment.paidAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href={`/orders/${order.id}`}>{t('payments.success.viewOrder')}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/orders">{t('payments.success.viewAllOrders')}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">{t('payments.success.continueShopping')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
