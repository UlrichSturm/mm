# US-003: Логин пользователя

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ✅ Выполнено

---

## User Story

**Как пользователь**, я хочу войти в систему через Keycloak, чтобы получить доступ к моему профилю

---

## Acceptance Criteria

- [ ] Endpoint `POST /auth/login` принимает username и password
- [ ] Использует Keycloak Direct Access Grants для аутентификации
- [ ] Возврат Keycloak access_token и refresh_token при успешном логине
- [ ] Синхронизация пользователя с локальной БД после логина
- [ ] Возврат данных пользователя (без пароля)
- [ ] Ошибка 401 при неверных credentials
- [ ] Работает для всех ролей (client, vendor, admin)

---

## API Specification

### Request

```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePass123"
}
```

### Response (Success - 200)

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

**Примечание:** Пользователь синхронизируется с локальной БД автоматически после логина.

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

- Использует Keycloak Direct Access Grants (Resource Owner Password Credentials)
- Не указывать конкретно что неверно (username или password) - security best practice
- Keycloak валидирует пароль
- Keycloak токен payload: `{ sub: userId, email, preferred_username, realm_access: { roles: [...] } }`
- Пользователь автоматически синхронизируется с локальной БД после успешного логина
- Для VENDOR статус проверяется из локальной БД после синхронизации

---

## Implementation

```typescript
// Использует Keycloak Admin API для Direct Access Grants
const response = await axios.post(
  `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
  new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password,
  }),
);
```

---

## Dependencies

- Keycloak сервер настроен и работает
- Keycloak client с Direct Access Grants включен
- US-001 (User model для синхронизации)
- US-002 (VendorProfile model для vendor login)

---

## Test Cases

1. ✅ Успешный логин client пользователя
2. ✅ Успешный логин vendor пользователя
3. ✅ Успешный логин admin пользователя
4. ✅ Ошибка при неверном username - 401
5. ✅ Ошибка при неверном password - 401
6. ✅ Пароль не возвращается в response
7. ✅ Keycloak токен валиден
8. ✅ Пользователь синхронизируется с локальной БД
9. ✅ Refresh token возвращается

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден
- [ ] Интеграционные тесты пройдены
