# US-050: Страница корзины

**Epic:** E-011 Client Orders  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть содержимое корзины

---

## Acceptance Criteria

- [ ] Страница `/cart`
- [ ] Список товаров в корзине
- [ ] Изменение количества
- [ ] Удаление товаров
- [ ] Итоговая сумма
- [ ] Кнопка "Оформить заказ"

---

## UI Layout

```
┌─────────────────────────────────────────────────┐
│              Корзина (2)                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────┐  Организация похорон      [-] 1 [+]   │
│  │ IMG │  45 000 ₽                    [✕]      │
│  └─────┘                                        │
│                                                 │
│  ┌─────┐  Юридические услуги       [-] 1 [+]   │
│  │ IMG │  15 000 ₽                    [✕]      │
│  └─────┘                                        │
│                                                 │
│  ─────────────────────────────────────────────  │
│                            Итого: 60 000 ₽     │
│                                                 │
│  [           Оформить заказ                  ]  │
└─────────────────────────────────────────────────┘
```

---

## Implementation

```typescript
// app/cart/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const router = useRouter();
  
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl mb-4">Корзина пуста</h1>
        <Link href="/services">Перейти к каталогу</Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Корзина ({items.length})</h1>
      <div className="space-y-4">
        {items.map(item => (
          <CartItem 
            key={item.serviceId} 
            item={item}
            onQuantityChange={(q) => updateQuantity(item.serviceId, q)}
            onRemove={() => removeItem(item.serviceId)}
          />
        ))}
      </div>
      <div className="mt-8 text-right">
        <p className="text-2xl font-bold">Итого: {total.toLocaleString()} ₽</p>
        <button
          onClick={() => router.push('/orders/create')}
          className="mt-4 bg-primary text-white py-3 px-8 rounded-lg"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  );
}
```

---

## Dependencies

- US-049 (Cart context)

---

## Definition of Done

- [ ] Страница создана и работает
- [ ] CRUD операции работают
- [ ] Responsive дизайн
- [ ] Code review пройден

