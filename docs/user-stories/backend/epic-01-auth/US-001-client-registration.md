# US-001: Регистрация Client пользователя

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу зарегистрироваться на платформе, чтобы получить доступ к услугам

---

## Acceptance Criteria

- [ ] Endpoint `POST /auth/register` принимает данные регистрации
- [ ] Форма регистрации с полями: email, password, firstName, lastName
- [ ] Валидация email формата (правильный email)
- [ ] Валидация password (минимум 8 символов, буквы и цифры)
- [ ] Проверка уникальности email (ошибка если уже существует)
- [ ] Хеширование пароля с помощью bcrypt
- [ ] Создание записи User с ролью CLIENT
- [ ] Возврат JWT токена после успешной регистрации
- [ ] Возврат данных пользователя (без пароля)

---

## API Specification

### Request

```http
POST /auth/register
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "SecurePass123",
  "firstName": "Иван",
  "lastName": "Петров"
}
```

### Response (Success - 201)

```json
{
  "user": {
    "id": "uuid",
    "email": "client@example.com",
    "firstName": "Иван",
    "lastName": "Петров",
    "role": "CLIENT",
    "createdAt": "2025-12-01T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (Error - 400)

```json
{
  "statusCode": 400,
  "message": ["email must be a valid email", "password must be at least 8 characters"],
  "error": "Bad Request"
}
```

### Response (Error - 409)

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## Technical Notes

- Использовать `@nestjs/jwt` для генерации токенов
- Использовать `bcrypt` с salt rounds = 10
- Использовать `class-validator` для валидации DTO
- JWT payload: `{ sub: userId, email, role }`
- JWT expiration: 24h (для MVP)

---

## Database

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  CLIENT
  VENDOR
  ADMIN
}
```

---

## Dependencies

- Нет (стартовая User Story)

---

## Test Cases

1. ✅ Успешная регистрация с валидными данными
2. ✅ Ошибка при невалидном email
3. ✅ Ошибка при коротком пароле
4. ✅ Ошибка при существующем email
5. ✅ Пароль не возвращается в response
6. ✅ JWT токен валиден и содержит правильные данные

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден
- [ ] Интеграционные тесты пройдены

