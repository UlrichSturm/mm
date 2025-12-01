# US-004: Logout пользователя

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как пользователь**, я хочу выйти из системы, чтобы защитить свой аккаунт

---

## Acceptance Criteria

- [ ] Endpoint `POST /auth/logout` доступен авторизованным пользователям
- [ ] Требует валидный JWT токен в Authorization header
- [ ] Возврат success response
- [ ] Client должен удалить токен на своей стороне

---

## API Specification

### Request

```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (Success - 200)

```json
{
  "message": "Successfully logged out"
}
```

### Response (Error - 401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Technical Notes

- В MVP logout stateless - просто возвращаем success
- Client удаляет токен из localStorage/cookies
- В будущем можно добавить blacklist токенов (Phase 2)
- Guard: `@UseGuards(JwtAuthGuard)`

---

## Implementation

```typescript
@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@Req() req: Request) {
  // В MVP просто возвращаем success
  // Client должен удалить токен
  return { message: 'Successfully logged out' };
}
```

---

## Dependencies

- US-006 (JwtAuthGuard)

---

## Test Cases

1. ✅ Успешный logout с валидным токеном
2. ✅ Ошибка 401 без токена
3. ✅ Ошибка 401 с невалидным токеном

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

