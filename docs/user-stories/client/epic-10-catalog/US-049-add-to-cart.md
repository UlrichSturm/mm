# US-049: Добавление в корзину

**Epic:** E-010 Client Catalog  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу добавить услугу в корзину

---

## Acceptance Criteria

- [ ] Кнопка на странице услуги
- [ ] Обновление счетчика корзины в header
- [ ] LocalStorage для сохранения
- [ ] Уведомление о добавлении
- [ ] Выбор количества (опционально)

---

## Implementation

```typescript
// context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (service: any) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  const addItem = (service: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.serviceId === service.id);
      if (existing) {
        return prev.map(i => 
          i.serviceId === service.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        serviceId: service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
      }];
    });
  };
  
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  
  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemsCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
```

---

## AddToCartButton Component

```typescript
// components/AddToCartButton.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export function AddToCartButton({ service }: { service: any }) {
  const { addItem } = useCart();
  
  const handleClick = () => {
    addItem(service);
    toast.success('Добавлено в корзину');
  };
  
  return (
    <button
      onClick={handleClick}
      className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark"
    >
      Добавить в корзину
    </button>
  );
}
```

---

## Dependencies

- None (client-side only)

---

## Definition of Done

- [ ] Добавление работает
- [ ] LocalStorage сохраняет
- [ ] Счетчик обновляется
- [ ] Code review пройден

