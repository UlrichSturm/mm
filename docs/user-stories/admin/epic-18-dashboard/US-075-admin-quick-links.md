# US-075: Быстрые ссылки

**Epic:** E-018 Admin Dashboard  
**Portal:** Admin Portal  
**Приоритет:** 🟢 Could Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу быстро перейти к функциям

---

## Acceptance Criteria

- [ ] Ссылки на модерацию
- [ ] Pending counts на кнопках
- [ ] Ссылки на основные разделы

---

## Implementation

```typescript
// components/QuickLinks.tsx
import Link from 'next/link';

export function QuickLinks({ pendingVendors, pendingServices }: { 
  pendingVendors: number; 
  pendingServices: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link
        href="/vendors?status=PENDING"
        className="p-4 border rounded-lg hover:bg-gray-50"
      >
        <div className="text-lg font-medium">Модерация Vendors</div>
        {pendingVendors > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            {pendingVendors}
          </span>
        )}
      </Link>
      <Link
        href="/services?status=PENDING_REVIEW"
        className="p-4 border rounded-lg hover:bg-gray-50"
      >
        <div className="text-lg font-medium">Модерация Services</div>
        {pendingServices > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            {pendingServices}
          </span>
        )}
      </Link>
    </div>
  );
}
```

---

## Dependencies

- US-073 (Dashboard)

---

## Definition of Done

- [ ] Ссылки работают
- [ ] Счетчики отображаются
- [ ] Code review пройден

