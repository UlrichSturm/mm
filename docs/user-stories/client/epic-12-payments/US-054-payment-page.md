# US-054: Страница оплаты

**Epic:** E-012 Client Payments  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 4  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу оплатить заказ

---

## Acceptance Criteria

- [ ] Страница `/payments/:orderId`
- [ ] Stripe Elements форма
- [ ] Сумма к оплате
- [ ] Кнопка "Оплатить"
- [ ] Loading state
- [ ] Error handling

---

## Implementation

```typescript
// app/payments/[orderId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/lib/api/payments';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

function PaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    setError('');
    
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments/success?orderId=${orderId}`,
      },
    });
    
    if (submitError) {
      setError(submitError.message || 'Payment failed');
    }
    setIsProcessing(false);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="text-red-500 mt-4">{error}</div>}
      <button 
        disabled={!stripe || isProcessing}
        className="w-full mt-6 bg-primary text-white py-3 rounded-lg"
      >
        {isProcessing ? 'Обработка...' : 'Оплатить'}
      </button>
    </form>
  );
}

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);
  
  useEffect(() => {
    createPaymentIntent(params.orderId).then(data => {
      setClientSecret(data.clientSecret);
      setAmount(data.amount);
    });
  }, [params.orderId]);
  
  if (!clientSecret) return <div>Загрузка...</div>;
  
  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Оплата заказа</h1>
      <p className="text-xl mb-6">Сумма: {amount.toLocaleString()} ₽</p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm orderId={params.orderId} />
      </Elements>
    </div>
  );
}
```

---

## Dependencies

- US-029 (Payment Intent API)
- Stripe.js

---

## Definition of Done

- [ ] Stripe Elements работает
- [ ] Оплата проходит (test mode)
- [ ] Error handling
- [ ] Code review пройден

