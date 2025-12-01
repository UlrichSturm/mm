# US-046: Поиск услуг

**Epic:** E-010 Client Catalog  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу искать услуги

---

## Acceptance Criteria

- [ ] Поле поиска в header и на странице каталога
- [ ] Debounce (300ms)
- [ ] Отображение результатов
- [ ] URL параметр ?search=xxx
- [ ] Минимум 2 символа для поиска

---

## Implementation

```typescript
// components/SearchInput.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash/debounce';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value.length >= 2) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      router.push(`/services?${params.toString()}`);
    }, 300),
    [router, searchParams]
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <input
      type="text"
      value={query}
      onChange={handleChange}
      placeholder="Поиск услуг..."
      className="w-full p-3 border rounded-lg"
    />
  );
}
```

---

## Dependencies

- US-014 (Search API)

---

## Definition of Done

- [ ] Поиск работает
- [ ] Debounce работает
- [ ] URL обновляется
- [ ] Code review пройден

