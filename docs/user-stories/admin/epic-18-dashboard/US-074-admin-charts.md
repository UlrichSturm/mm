# US-074: Графики (базовые)

**Epic:** E-018 Admin Dashboard  
**Portal:** Admin Portal  
**Приоритет:** 🟢 Could Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу видеть графики

---

## Acceptance Criteria

- [ ] График заказов за период
- [ ] График регистраций за период
- [ ] Выбор периода (7 дней, 30 дней)

---

## Implementation

```typescript
// components/OrdersChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function OrdersChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## Dependencies

- US-033 (Admin stats API with time series)
- recharts library

---

## Definition of Done

- [ ] Графики отображаются
- [ ] Выбор периода работает
- [ ] Code review пройден

