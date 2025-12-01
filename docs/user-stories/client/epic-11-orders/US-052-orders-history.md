# US-052: История заказов

**Epic:** E-011 Client Orders  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть историю моих заказов

---

## Acceptance Criteria

- [ ] Страница `/orders`
- [ ] Список заказов с пагинацией
- [ ] Статусы заказов
- [ ] Фильтрация по статусам
- [ ] Ссылки на детали заказа

---

## Implementation

```typescript
// app/orders/page.tsx
'use client';

import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/OrderCard';
import { StatusFilter } from '@/components/StatusFilter';

export default function OrdersPage() {
  const { orders, meta, isLoading, status, setStatus, page, setPage } = useOrders();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>
      <StatusFilter value={status} onChange={setStatus} />
      <div className="space-y-4 mt-6">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
      <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
    </div>
  );
}
```

---

## Dependencies

- US-024 (Orders list API)

---

## Definition of Done

- [ ] Страница работает
- [ ] Фильтрация работает
- [ ] Responsive дизайн
- [ ] Code review пройден

