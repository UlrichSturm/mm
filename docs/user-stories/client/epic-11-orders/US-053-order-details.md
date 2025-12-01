# US-053: Детали заказа

**Epic:** E-011 Client Orders  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть детали заказа

---

## Acceptance Criteria

- [ ] Страница `/orders/:id`
- [ ] Полная информация о заказе
- [ ] Статус заказа
- [ ] Информация о поставщике
- [ ] Кнопка отмены (если PENDING)

---

## Implementation

```typescript
// app/orders/[id]/page.tsx
import { getOrder } from '@/lib/api/orders';
import { notFound } from 'next/navigation';
import { OrderStatus } from '@/components/OrderStatus';
import { CancelOrderButton } from '@/components/CancelOrderButton';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) notFound();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Заказ #{order.id.slice(0, 8)}</h1>
      <OrderStatus status={order.status} />
      <div className="mt-8 grid gap-6">
        <ServiceInfo service={order.service} />
        <VendorInfo vendor={order.vendor} />
        <PaymentInfo payment={order.payment} />
        {order.status === 'PENDING' && (
          <CancelOrderButton orderId={order.id} />
        )}
      </div>
    </div>
  );
}
```

---

## Dependencies

- US-026 (Order details API)

---

## Definition of Done

- [ ] Страница работает
- [ ] Отмена работает
- [ ] Code review пройден

