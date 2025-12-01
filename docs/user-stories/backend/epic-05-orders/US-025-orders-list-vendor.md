# US-025: Просмотр заказов (Vendor)

**Epic:** E-005 Orders  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу видеть заказы на мои услуги, чтобы их обработать

---

## Acceptance Criteria

- [ ] Endpoint `GET /vendor/orders` доступен VENDOR
- [ ] Возвращает только заказы на услуги текущего vendor
- [ ] Пагинация
- [ ] Фильтрация по статусу
- [ ] Включает данные клиента (имя, контакт)

---

## API Specification

### Request

```http
GET /vendor/orders?page=1&limit=10&status=PENDING
Authorization: Bearer <vendor-token>
```

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "quantity": 1,
      "totalPrice": 45000,
      "notes": "Нужна доставка до 12:00",
      "status": "PENDING",
      "createdAt": "2025-12-01T10:00:00Z",
      "service": {
        "id": "uuid",
        "name": "Организация похорон под ключ"
      },
      "client": {
        "id": "uuid",
        "firstName": "Иван",
        "lastName": "Петров",
        "email": "client@example.com"
      }
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Implementation

```typescript
@Get('vendor/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
async getVendorOrders(
  @CurrentUser() user: User,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('status') status?: OrderStatus,
) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  
  const where: Prisma.OrderWhereInput = {
    service: { vendorId: vendor.id },
  };
  if (status) where.status = status;
  
  const [data, total] = await Promise.all([
    this.prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { id: true, name: true } },
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    this.prisma.order.count({ where }),
  ]);
  
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
```

---

## Dependencies

- US-005 (RBAC)
- US-023 (Order model)
- US-007 (VendorProfile)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

