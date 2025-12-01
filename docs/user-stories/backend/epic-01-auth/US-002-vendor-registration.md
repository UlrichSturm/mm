# US-002: Регистрация Vendor пользователя

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу зарегистрироваться на платформе, чтобы размещать свои услуги

---

## Acceptance Criteria

- [ ] Endpoint `POST /auth/register/vendor` принимает данные регистрации
- [ ] Дополнительные поля: businessName, phone, address, postalCode
- [ ] Валидация всех обязательных полей
- [ ] Создание User с ролью VENDOR
- [ ] Создание VendorProfile со статусом PENDING
- [ ] Статус PENDING после регистрации (требует модерации)
- [ ] Возврат JWT токена после регистрации
- [ ] Email уведомление о pending статусе (интеграция с Epic 8)

---

## API Specification

### Request

```http
POST /auth/register/vendor
Content-Type: application/json

{
  "email": "vendor@example.com",
  "password": "SecurePass123",
  "firstName": "Алексей",
  "lastName": "Иванов",
  "businessName": "Ритуальные услуги АИ",
  "phone": "+7 999 123-45-67",
  "address": "г. Москва, ул. Примерная, д. 1",
  "postalCode": "123456"
}
```

### Response (Success - 201)

```json
{
  "user": {
    "id": "uuid",
    "email": "vendor@example.com",
    "firstName": "Алексей",
    "lastName": "Иванов",
    "role": "VENDOR",
    "createdAt": "2025-12-01T10:00:00Z"
  },
  "vendor": {
    "id": "uuid",
    "businessName": "Ритуальные услуги АИ",
    "phone": "+7 999 123-45-67",
    "address": "г. Москва, ул. Примерная, д. 1",
    "postalCode": "123456",
    "status": "PENDING"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Ваша заявка на регистрацию отправлена на модерацию"
}
```

### Response (Error - 400)

```json
{
  "statusCode": 400,
  "message": ["businessName should not be empty", "phone should not be empty"],
  "error": "Bad Request"
}
```

---

## Technical Notes

- Использовать транзакцию Prisma для создания User + VendorProfile
- VendorProfile связан с User через userId (1:1)
- Статус PENDING блокирует создание услуг до одобрения
- При одобрении статус меняется на APPROVED

---

## Database

```prisma
model VendorProfile {
  id           String       @id @default(uuid())
  userId       String       @unique
  user         User         @relation(fields: [userId], references: [id])
  businessName String
  phone        String
  address      String
  postalCode   String
  status       VendorStatus @default(PENDING)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  services     Service[]
}

enum VendorStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}
```

---

## Dependencies

- US-001 (базовая структура User)

---

## Test Cases

1. ✅ Успешная регистрация с валидными данными
2. ✅ Ошибка при отсутствии businessName
3. ✅ Ошибка при отсутствии phone
4. ✅ VendorProfile создается со статусом PENDING
5. ✅ User создается с ролью VENDOR
6. ✅ JWT токен содержит role: VENDOR

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден
- [ ] Интеграционные тесты пройдены

