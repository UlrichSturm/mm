# US-014: Поиск услуг

**Epic:** E-003 Services Catalog  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу искать услуги по названию, чтобы быстро найти нужное

---

## Acceptance Criteria

- [ ] Query параметр `search` для поиска
- [ ] Поиск по name и description
- [ ] Case-insensitive поиск
- [ ] Минимум 2 символа для поиска
- [ ] Комбинируется с пагинацией
- [ ] Комбинируется с фильтрами

---

## API Specification

### Request

```http
GET /services?search=похороны&page=1&limit=12
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| search | string | - | Поисковый запрос (min 2 символа) |
| page | number | 1 | Номер страницы |
| limit | number | 12 | Количество на странице |

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Организация похорон под ключ",
      "description": "Полный комплекс ритуальных услуг...",
      "price": 45000
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 12,
    "totalPages": 3,
    "searchQuery": "похороны"
  }
}
```

### Response (Error - 400)

```json
{
  "statusCode": 400,
  "message": "Search query must be at least 2 characters",
  "error": "Bad Request"
}
```

---

## Technical Notes

- Использовать Prisma `contains` с `mode: 'insensitive'`
- Поиск по OR (name OR description)
- Валидировать минимальную длину запроса
- В будущем можно добавить full-text search

---

## Implementation

```typescript
@Get()
async getServices(
  @Query('search') search?: string,
  @Query('page') page = 1,
  @Query('limit') limit = 12,
) {
  // Validate search query
  if (search && search.length < 2) {
    throw new BadRequestException('Search query must be at least 2 characters');
  }
  
  const take = Math.min(limit, 50);
  const skip = (page - 1) * take;
  
  const where: Prisma.ServiceWhereInput = {
    status: 'ACTIVE',
    vendor: { status: 'APPROVED' },
  };
  
  // Add search filter
  if (search) {
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
      searchQuery: search || null,
    },
  };
}
```

---

## Future Improvements (Phase 2)

- PostgreSQL Full-Text Search для лучшей релевантности
- Поиск по тегам/ключевым словам
- Подсказки при вводе (autocomplete)
- История поиска

---

## Dependencies

- US-013 (базовый каталог услуг)

---

## Test Cases

1. ✅ Поиск находит по name
2. ✅ Поиск находит по description
3. ✅ Case-insensitive работает
4. ✅ Короткий запрос (<2 символов) - ошибка
5. ✅ Пустой результат возвращается корректно
6. ✅ Комбинация с пагинацией работает

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

