# US-019: Создание категории

**Epic:** E-004 Categories  
**Portal:** Backend  
**Приоритет:** 🟡 Should Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу создать категорию, чтобы организовать услуги

---

## Acceptance Criteria

- [ ] Endpoint `POST /categories` доступен только ADMIN
- [ ] Поля: name, description, icon (опционально)
- [ ] Уникальность name
- [ ] Валидация данных

---

## API Specification

### Request

```http
POST /categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Ритуальные услуги",
  "description": "Услуги по организации похорон и поминальных мероприятий",
  "icon": "funeral"
}
```

### Response (Success - 201)

```json
{
  "id": "uuid",
  "name": "Ритуальные услуги",
  "description": "Услуги по организации похорон...",
  "icon": "funeral",
  "createdAt": "2025-12-01T10:00:00Z"
}
```

---

## Database Schema

```prisma
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  icon        String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  services    Service[]
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-006 (JWT Guard)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

