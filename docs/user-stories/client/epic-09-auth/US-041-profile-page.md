# US-041: Страница профиля

**Epic:** E-009 Client Authentication  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть и редактировать свой профиль

---

## Acceptance Criteria

- [ ] Страница `/profile`
- [ ] Защищенный route (требует auth)
- [ ] Отображение текущих данных
- [ ] Редактирование firstName, lastName
- [ ] Сохранение изменений

---

## UI Components

```
┌─────────────────────────────────────┐
│           Мой профиль               │
├─────────────────────────────────────┤
│                                     │
│  Email:        client@example.com   │
│  Имя:          [Иван____________]   │
│  Фамилия:      [Петров__________]   │
│                                     │
│  [        Сохранить              ]  │
│                                     │
│  ─────────────────────────────────  │
│  [        Выйти из системы       ]  │
└─────────────────────────────────────┘
```

---

## Implementation

```typescript
// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ firstName, lastName });
      // Show success message
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Мой профиль</h1>
      {/* Profile form */}
    </div>
  );
}
```

---

## Dependencies

- US-006 (JWT Guard)
- US-043 (Route protection)

---

## Definition of Done

- [ ] Страница создана и работает
- [ ] Редактирование работает
- [ ] Responsive дизайн
- [ ] Code review пройден

