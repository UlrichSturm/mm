# US-020: Просмотр списка категорий

**Epic:** E-004 Categories  
**Portal:** Backend  
**Приоритет:** 🟡 Should Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть список категорий, чтобы выбрать нужную

---

## Acceptance Criteria

- [ ] Endpoint `GET /categories` публичный
- [ ] Возвращает все категории
- [ ] Опционально: количество услуг в каждой категории

---

## API Specification

### Request

```http
GET /categories
```

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ритуальные услуги",
      "description": "Услуги по организации похорон",
      "icon": "funeral",
      "servicesCount": 25
    },
    {
      "id": "uuid",
      "name": "Юридические услуги",
      "description": "Оформление документов",
      "icon": "legal",
      "servicesCount": 15
    }
  ]
}
```

---

## Implementation

```typescript
@Get()
async getCategories() {
  const categories = await this.prisma.category.findMany({
    include: {
      _count: {
        select: {
          services: {
            where: {
              status: 'ACTIVE',
              vendor: { status: 'APPROVED' },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  
  return {
    data: categories.map(cat => ({
      ...cat,
      servicesCount: cat._count.services,
    })),
  };
}
```

---

## Dependencies

- US-019 (Category model)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

