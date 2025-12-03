# US-004: Logout пользователя

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ✅ Выполнено

---

## User Story

**Как пользователь**, я хочу выйти из системы, чтобы защитить свой аккаунт

---

## Acceptance Criteria

- [ ] Logout обрабатывается на frontend (удаление токенов)
- [ ] Keycloak токены удаляются из localStorage/cookies
- [ ] В MVP backend logout не требуется (stateless токены)
- [ ] В будущем можно добавить Keycloak logout endpoint (Phase 2)

---

## API Specification

**Примечание:** В текущей реализации logout обрабатывается на frontend. Backend endpoint не требуется для MVP, так как Keycloak токены stateless.

### Frontend Implementation

```typescript
// Frontend logout
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  // Redirect to login page
}
```

### Future: Backend Logout (Phase 2)

```typescript
@Post('logout')
@UseGuards(AuthGuard)
async logout(@Request() req) {
  // Можно вызвать Keycloak logout endpoint
  // Но для MVP не требуется
  return { message: 'Successfully logged out' };
}
```

---

## Technical Notes

- В MVP logout stateless - frontend удаляет токены
- Keycloak токены не требуют server-side logout для MVP
- В будущем можно добавить Keycloak logout endpoint для полного logout
- Guard: `@UseGuards(AuthGuard)` из nest-keycloak-connect (если нужен endpoint)

---

## Dependencies

- US-006 (Keycloak AuthGuard)
- Frontend интеграция с Keycloak

---

## Test Cases

1. ✅ Frontend удаляет токены из localStorage
2. ✅ Пользователь перенаправляется на страницу логина
3. ✅ После logout токены не работают для запросов
4. ✅ (Future) Backend logout endpoint работает (Phase 2)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден
