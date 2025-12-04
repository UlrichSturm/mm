# US-013: Просмотр каталога услуг

**Epic:** E-003 Services Catalog
**Portal:** Backend
**Приоритет:** 🔴 Must Have
**Story Points:** 3
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу просмотреть каталог услуг, чтобы найти нужную услугу

---

## Acceptance Criteria

- [ ] Endpoint `GET /services` публичный (без авторизации)
- [ ] Возвращает только услуги APPROVED поставщиков
- [ ] Возвращает только ACTIVE услуги
- [ ] Пагинация (limit, offset/page)
- [ ] Включает данные поставщика и категории
- [ ] Сортировка по умолчанию: createdAt desc

---

## API Specification

### Request

```http
GET /services?page=1&limit=12
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Номер страницы |
| limit | number | 12 | Количество на странице (max 10) |
| search | string | - | Поисковый запрос (min 2 символа) |
| categoryId | string | - | Фильтр по категории |
| vendorId | string | - | Фильтр по поставщику |
| minPrice | number | - | Минимальная цена |
| maxPrice | number | - | Максимальная цена |
| sortBy | string | createdAt_desc | Сортировка: createdAt_desc, createdAt_asc, price_asc, price_desc, name_asc, name_desc, rating_asc, rating_desc |

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Организация похорон под ключ",
      "description": "Полный комплекс ритуальных услуг...",
      "price": 45000,
      "images": ["https://example.com/image1.jpg"],
      "status": "ACTIVE",
      "createdAt": "2025-12-01T10:00:00Z",
      "vendor": {
        "id": "uuid",
        "businessName": "Ритуальные услуги АИ"
      },
      "category": {
        "id": "uuid",
        "name": "Ритуальные услуги"
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 12,
    "totalPages": 13
  }
}
```

---

## Technical Notes

- Фильтровать по vendor.status = APPROVED
- Фильтровать по service.status = ACTIVE
- Использовать include для vendor и category
- Limit max 10 для производительности
- Индексы на status полях
- Поддержка фильтров по цене (minPrice/maxPrice)
- Поддержка сортировки по различным полям

---

## Implementation

```typescript
@Get()
async getServices(
  @Query('page') page = 1,
  @Query('limit') limit = 12,
) {
  const take = Math.min(limit, 50);
  const skip = (page - 1) * take;

  const where: Prisma.ServiceWhereInput = {
    status: 'ACTIVE',
    vendor: { status: 'APPROVED' },
  };

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
    meta: { total, page, limit: take, totalPages: Math.ceil(total / take) },
  };
}
```

---

## Database Indexes

```prisma
model Service {
  // ... fields

  @@index([status])
  @@index([vendorId])
  @@index([categoryId])
  @@index([createdAt])
}
```

---

## Dependencies

- US-012 (Service model)
- US-007 (VendorProfile для фильтра по статусу)

---

## Test Cases

1. ✅ Публичный доступ работает
2. ✅ Только ACTIVE услуги возвращаются
3. ✅ Только услуги APPROVED vendors возвращаются
4. ✅ Пагинация работает
5. ✅ Limit ограничен 10
6. ✅ Vendor и category включены
7. ✅ Фильтры по цене работают
8. ✅ Сортировка работает

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден
- [ ] Производительность проверена

