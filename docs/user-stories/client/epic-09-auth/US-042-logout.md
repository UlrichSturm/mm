# US-042: Logout функциональность

**Epic:** E-009 Client Authentication  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу выйти из системы

---

## Acceptance Criteria

- [ ] Кнопка Logout в header/menu
- [ ] Удаление токена из localStorage
- [ ] Redirect на главную страницу
- [ ] Очистка состояния пользователя

---

## Implementation

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/';
  };
  
  return { user, logout };
}

// components/Header.tsx
export function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header>
      {user ? (
        <button onClick={logout}>Выйти</button>
      ) : (
        <Link href="/login">Войти</Link>
      )}
    </header>
  );
}
```

---

## Dependencies

- US-004 (Backend logout - optional)

---

## Definition of Done

- [ ] Logout работает
- [ ] Токен удаляется
- [ ] Redirect работает
- [ ] Code review пройден

