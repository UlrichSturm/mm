# US-008: Просмотр списка поставщиков (Admin)

**Epic:** E-002 Vendors Management  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу видеть список всех поставщиков, чтобы модерировать их

---

## Acceptance Criteria

- [ ] Endpoint `GET /admin/vendors` доступен только ADMIN
- [ ] Возвращает список всех поставщиков с пагинацией
- [ ] Фильтрация по статусам (PENDING, APPROVED, REJECTED, SUSPENDED)
- [ ] Поиск по businessName
- [ ] Включает данные User (email, firstName, lastName)
- [ ] Сортировка по createdAt (desc по умолчанию)

---

## API Specification

### Request

```http
GET /admin/vendors?status=PENDING&page=1&limit=10&search=ритуал
Authorization: Bearer <admin-token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | VendorStatus | - | Фильтр по статусу |
| page | number | 1 | Номер страницы |
| limit | number | 10 | Количество на странице |
| search | string | - | Поиск по businessName |

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "businessName": "Ритуальные услуги АИ",
      "contactPhone": "+7 999 123-45-67",
      "address": "г. Москва, ул. Примерная, д. 1",
      "postalCode": "123456",
      "status": "PENDING",
      "createdAt": "2025-12-01T10:00:00Z",
      "user": {
        "id": "uuid",
        "email": "vendor@example.com",
        "firstName": "Алексей",
        "lastName": "Иванов"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Response (Error - 403)

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

## Technical Notes

- Использовать `@Roles(Role.ADMIN)` декоратор
- Пагинация через skip/take в Prisma
- Include user relation для данных пользователя
- Case-insensitive поиск по businessName

---

## Implementation

```typescript
@Get('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async getVendors(
  @Query('status') status?: VendorStatus,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('search') search?: string,
) {
  const where: Prisma.VendorProfileWhereInput = {};
  
  if (status) where.status = status;
  if (search) {
    where.businessName = { contains: search, mode: 'insensitive' };
  }
  
  const [data, total] = await Promise.all([
    this.prisma.vendorProfile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
    this.prisma.vendorProfile.count({ where }),
  ]);
  
  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-006 (JWT Guard)
- US-007 (VendorProfile model)

---

## Test Cases

1. ✅ ADMIN может получить список vendors
2. ✅ CLIENT получает 403
3. ✅ Фильтрация по статусу работает
4. ✅ Поиск по businessName работает
5. ✅ Пагинация работает корректно
6. ✅ User data включена в response

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

