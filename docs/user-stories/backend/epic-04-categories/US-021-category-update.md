# US-021: Редактирование категории

**Epic:** E-004 Categories  
**Portal:** Backend  
**Приоритет:** 🟡 Should Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу редактировать категорию, чтобы обновить информацию

---

## Acceptance Criteria

- [ ] Endpoint `PATCH /categories/:id` доступен только ADMIN
- [ ] Можно обновить: name, description, icon
- [ ] Проверка уникальности name при обновлении
- [ ] 404 если категория не найдена

---

## API Specification

### Request

```http
PATCH /categories/uuid
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Обновленное название",
  "description": "Новое описание"
}
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "name": "Обновленное название",
  "description": "Новое описание",
  "icon": "funeral",
  "updatedAt": "2025-12-01T14:00:00Z"
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-019 (Category model)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

