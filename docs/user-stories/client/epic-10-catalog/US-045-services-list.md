# US-045: Страница каталога услуг

**Epic:** E-010 Client Catalog  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу просматривать все услуги

---

## Acceptance Criteria

- [ ] Страница `/services`
- [ ] Grid/List view
- [ ] Пагинация
- [ ] Loading state
- [ ] Empty state

---

## Implementation

```typescript
// app/services/page.tsx
'use client';

import { useServices } from '@/hooks/useServices';
import { ServiceCard } from '@/components/ServiceCard';
import { Pagination } from '@/components/Pagination';

export default function ServicesPage() {
  const { services, meta, isLoading, page, setPage } = useServices();
  
  if (isLoading) return <LoadingGrid />;
  if (services.length === 0) return <EmptyState />;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог услуг</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      <Pagination 
        currentPage={page} 
        totalPages={meta.totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
}
```

---

## Dependencies

- US-013 (Services API)

---

## Definition of Done

- [ ] Страница создана и работает
- [ ] Пагинация работает
- [ ] Responsive дизайн
- [ ] Code review пройден

