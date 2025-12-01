# US-056: История платежей

**Epic:** E-012 Client Payments  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть историю платежей

---

## Acceptance Criteria

- [ ] Страница `/payments`
- [ ] Список платежей
- [ ] Статусы платежей
- [ ] Ссылки на заказы

---

## Implementation

```typescript
// app/payments/page.tsx
'use client';

import { usePayments } from '@/hooks/usePayments';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function PaymentsPage() {
  const { payments, isLoading } = usePayments();
  
  if (isLoading) return <div>Загрузка...</div>;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">История платежей</h1>
      <div className="space-y-4">
        {payments.map(payment => (
          <div key={payment.id} className="border rounded-lg p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{payment.order.service.name}</p>
                <p className="text-sm text-gray-500">{formatDate(payment.paidAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(payment.amount)}</p>
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Dependencies

- US-032 (Payments history API)

---

## Definition of Done

- [ ] Страница работает
- [ ] Статусы отображаются
- [ ] Code review пройден

