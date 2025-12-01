# US-047: Фильтрация по категориям

**Epic:** E-010 Client Catalog  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу фильтровать по категориям

---

## Acceptance Criteria

- [ ] Sidebar с категориями
- [ ] Фильтрация без перезагрузки страницы
- [ ] URL параметр ?categoryId=xxx
- [ ] Активная категория выделена

---

## Implementation

```typescript
// components/CategoryFilter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories } = useCategories();
  const activeCategoryId = searchParams.get('categoryId');
  
  const handleCategoryClick = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    params.delete('page'); // Reset pagination
    router.push(`/services?${params.toString()}`);
  };
  
  return (
    <div className="space-y-2">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`w-full text-left p-2 rounded ${!activeCategoryId ? 'bg-primary text-white' : ''}`}
      >
        Все категории
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.id)}
          className={`w-full text-left p-2 rounded ${activeCategoryId === cat.id ? 'bg-primary text-white' : ''}`}
        >
          {cat.name} ({cat.servicesCount})
        </button>
      ))}
    </div>
  );
}
```

---

## Dependencies

- US-015 (Filter API)
- US-020 (Categories API)

---

## Definition of Done

- [ ] Фильтрация работает
- [ ] URL обновляется
- [ ] Code review пройден

