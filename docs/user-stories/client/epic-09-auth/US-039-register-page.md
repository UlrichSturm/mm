# US-039: Страница регистрации

**Epic:** E-009 Client Authentication  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу зарегистрироваться через форму

---

## Acceptance Criteria

- [ ] Страница `/register`
- [ ] Форма: email, password, confirmPassword, firstName, lastName
- [ ] Валидация на клиенте
- [ ] Показ ошибок валидации
- [ ] Интеграция с API `POST /auth/register`
- [ ] Redirect на `/` после успешной регистрации
- [ ] Сохранение токена в localStorage
- [ ] Ссылка на страницу логина

---

## UI Components

```
┌─────────────────────────────────────┐
│           Регистрация               │
├─────────────────────────────────────┤
│                                     │
│  Email:        [________________]   │
│  Пароль:       [________________]   │
│  Повторите:    [________________]   │
│  Имя:          [________________]   │
│  Фамилия:      [________________]   │
│                                     │
│  [       Зарегистрироваться       ] │
│                                     │
│  Уже есть аккаунт? Войти            │
└─────────────────────────────────────┘
```

---

## Validation Rules

- Email: required, valid email format
- Password: required, min 8 chars
- Confirm Password: must match password
- First Name: required, min 2 chars
- Last Name: required, min 2 chars

---

## Implementation

```typescript
// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(formData);
      router.push('/');
    } catch (error) {
      setErrors(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Регистрация</h1>
        {/* Form fields */}
      </form>
    </div>
  );
}
```

---

## Dependencies

- US-001 (Backend registration API)

---

## Test Cases

1. ✅ Успешная регистрация с redirect
2. ✅ Показ ошибки при существующем email
3. ✅ Валидация полей на клиенте
4. ✅ Пароли не совпадают - ошибка
5. ✅ Loading state при отправке

---

## Definition of Done

- [ ] Страница создана и работает
- [ ] Валидация работает
- [ ] Интеграция с API работает
- [ ] Responsive дизайн
- [ ] Code review пройден

