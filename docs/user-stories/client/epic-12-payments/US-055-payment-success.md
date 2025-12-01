# US-055: Обработка результата платежа

**Epic:** E-012 Client Payments  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть результат платежа

---

## Acceptance Criteria

- [ ] Страница `/payments/success`
- [ ] Success/Error состояние
- [ ] Подтверждение платежа через API
- [ ] Redirect на страницу заказа

---

## Implementation

```typescript
// app/payments/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmPayment } from '@/lib/api/payments';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const orderId = searchParams.get('orderId');
    
    if (paymentIntentId) {
      confirmPayment(paymentIntentId)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [searchParams]);
  
  if (status === 'loading') {
    return <div className="text-center py-16">Проверка платежа...</div>;
  }
  
  if (status === 'error') {
    return (
      <div className="text-center py-16">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Ошибка оплаты</h1>
        <p className="text-gray-600 mb-6">Платеж не прошел. Попробуйте снова.</p>
        <button onClick={() => router.back()}>Попробовать снова</button>
      </div>
    );
  }
  
  return (
    <div className="text-center py-16">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-4">Оплата прошла успешно!</h1>
      <p className="text-gray-600 mb-6">Ваш заказ подтвержден.</p>
      <Link href="/orders" className="text-primary">Перейти к заказам</Link>
    </div>
  );
}
```

---

## Dependencies

- US-030 (Confirm payment API)

---

## Definition of Done

- [ ] Success page работает
- [ ] Error handling
- [ ] Code review пройден

