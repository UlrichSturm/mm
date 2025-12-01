# US-003: Логин пользователя

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как пользователь**, я хочу войти в систему, чтобы получить доступ к моему профилю

---

## Acceptance Criteria

- [ ] Endpoint `POST /auth/login` принимает email и password
- [ ] Проверка существования пользователя по email
- [ ] Проверка пароля с помощью bcrypt.compare
- [ ] Возврат JWT токена при успешном логине
- [ ] Возврат данных пользователя (без пароля)
- [ ] Ошибка 401 при неверных credentials
- [ ] Работает для всех ролей (CLIENT, VENDOR, ADMIN)

---

## API Specification

### Request

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Response (Success - 200)

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Иван",
    "lastName": "Петров",
    "role": "CLIENT",
    "createdAt": "2025-12-01T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (Error - 401)

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## Technical Notes

- Не указывать конкретно что неверно (email или password) - security best practice
- Использовать `bcrypt.compare()` для проверки пароля
- JWT payload: `{ sub: userId, email, role }`
- Для VENDOR включить статус в response (для проверки модерации)

---

## Extended Response for Vendor

```json
{
  "user": {
    "id": "uuid",
    "email": "vendor@example.com",
    "firstName": "Алексей",
    "lastName": "Иванов",
    "role": "VENDOR"
  },
  "vendor": {
    "id": "uuid",
    "businessName": "Ритуальные услуги АИ",
    "status": "APPROVED"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Dependencies

- US-001 (User model)
- US-002 (VendorProfile model для vendor login)

---

## Test Cases

1. ✅ Успешный логин CLIENT
2. ✅ Успешный логин VENDOR (с vendor data)
3. ✅ Успешный логин ADMIN
4. ✅ Ошибка при неверном email
5. ✅ Ошибка при неверном password
6. ✅ Пароль не возвращается в response
7. ✅ JWT токен валиден

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден
- [ ] Интеграционные тесты пройдены

