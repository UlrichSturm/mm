# US-051: Создание заказа

**Epic:** E-011 Client Orders  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу оформить заказ из корзины

---

## Acceptance Criteria

- [ ] Кнопка "Оформить заказ" из корзины
- [ ] Форма с дополнительными данными (notes)
- [ ] Интеграция с API `POST /orders`
- [ ] Redirect на страницу оплаты
- [ ] Очистка корзины после создания

---

## Implementation

```typescript
// app/orders/create/page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/lib/api/orders';

export default function CreateOrderPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Create orders for each item
      for (const item of items) {
        const order = await createOrder({
          serviceId: item.serviceId,
          quantity: item.quantity,
          notes,
        });
        // Redirect to payment for first order
        router.push(`/payments/${order.id}`);
      }
      clearCart();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
      <OrderSummary items={items} total={total} />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Дополнительные пожелания..."
        className="w-full p-3 border rounded-lg mt-4"
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full mt-4 bg-primary text-white py-3 rounded-lg"
      >
        {isLoading ? 'Создание...' : 'Перейти к оплате'}
      </button>
    </div>
  );
}
```

---

## Dependencies

- US-023 (Create order API)
- US-050 (Cart page)

---

## Definition of Done

- [ ] Создание работает
- [ ] Redirect на оплату
- [ ] Корзина очищается
- [ ] Code review пройден

