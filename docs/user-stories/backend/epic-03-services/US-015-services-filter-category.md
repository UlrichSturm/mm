# US-015: Фильтрация по категориям

**Epic:** E-003 Services Catalog  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу фильтровать услуги по категориям, чтобы сузить поиск

---

## Acceptance Criteria

- [ ] Query параметр `categoryId` для фильтрации
- [ ] Возврат услуг только выбранной категории
- [ ] Комбинируется с поиском и пагинацией
- [ ] Невалидный categoryId возвращает пустой результат (не ошибку)

---

## API Specification

### Request

```http
GET /services?categoryId=uuid&page=1&limit=12
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| categoryId | UUID | - | ID категории |
| search | string | - | Поисковый запрос |
| page | number | 1 | Номер страницы |
| limit | number | 12 | Количество на странице |

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Организация похорон под ключ",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "Ритуальные услуги"
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 12,
    "totalPages": 2,
    "categoryId": "uuid"
  }
}
```

---

## Technical Notes

- Добавить categoryId в where условие
- Можно комбинировать с search
- Невалидный UUID просто возвращает пустой результат
- Опционально: поддержка множественных категорий (categoryId[])

---

## Implementation

```typescript
@Get()
async getServices(
  @Query('categoryId') categoryId?: string,
  @Query('search') search?: string,
  @Query('page') page = 1,
  @Query('limit') limit = 12,
) {
  const take = Math.min(limit, 50);
  const skip = (page - 1) * take;
  
  const where: Prisma.ServiceWhereInput = {
    status: 'ACTIVE',
    vendor: { status: 'APPROVED' },
  };
  
  // Add category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  // Add search filter
  if (search && search.length >= 2) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  const [data, total] = await Promise.all([
    this.prisma.service.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { id: true, businessName: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    this.prisma.service.count({ where }),
  ]);
  
  return {
    data,
    meta: { 
      total, 
      page, 
      limit: take, 
      totalPages: Math.ceil(total / take),
      categoryId: categoryId || null,
    },
  };
}
```

---

## Dependencies

- US-013 (базовый каталог услуг)
- US-014 (поиск - для комбинации)
- US-019 (Categories - Epic 4)

---

## Test Cases

1. ✅ Фильтрация по категории работает
2. ✅ Невалидный categoryId возвращает пустой массив
3. ✅ Комбинация с search работает
4. ✅ Комбинация с пагинацией работает
5. ✅ Без categoryId возвращаются все услуги

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

