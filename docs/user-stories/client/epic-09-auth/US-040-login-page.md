# US-040: Страница логина

**Epic:** E-009 Client Authentication  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу войти в систему

---

## Acceptance Criteria

- [ ] Страница `/login`
- [ ] Форма: email, password
- [ ] Валидация на клиенте
- [ ] Интеграция с API `POST /auth/login`
- [ ] Сохранение токена в localStorage
- [ ] Redirect на предыдущую страницу или `/`
- [ ] Ссылка на страницу регистрации
- [ ] Показ ошибки при неверных credentials

---

## UI Components

```
┌─────────────────────────────────────┐
│              Вход                   │
├─────────────────────────────────────┤
│                                     │
│  Email:        [________________]   │
│  Пароль:       [________________]   │
│                                     │
│  [           Войти                ] │
│                                     │
│  Нет аккаунта? Зарегистрироваться   │
└─────────────────────────────────────┘
```

---

## Implementation

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    } catch (err) {
      setError('Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Вход</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {/* Form fields */}
      </form>
    </div>
  );
}
```

---

## Dependencies

- US-003 (Backend login API)

---

## Test Cases

1. ✅ Успешный логин с redirect
2. ✅ Показ ошибки при неверных данных
3. ✅ Redirect на предыдущую страницу
4. ✅ Loading state при отправке

---

## Definition of Done

- [ ] Страница создана и работает
- [ ] Интеграция с API работает
- [ ] Responsive дизайн
- [ ] Code review пройден

