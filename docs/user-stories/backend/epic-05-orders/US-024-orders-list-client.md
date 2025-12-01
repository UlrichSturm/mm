# US-024: Просмотр заказов (Client)

**Epic:** E-005 Orders  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть историю моих заказов

---

## Acceptance Criteria

- [ ] Endpoint `GET /orders` доступен CLIENT
- [ ] Возвращает только заказы текущего клиента
- [ ] Пагинация
- [ ] Сортировка по дате (desc)
- [ ] Фильтрация по статусу (опционально)
- [ ] Включает данные услуги

---

## API Specification

### Request

```http
GET /orders?page=1&limit=10&status=COMPLETED
Authorization: Bearer <client-token>
```

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "quantity": 1,
      "totalPrice": 45000,
      "status": "COMPLETED",
      "createdAt": "2025-12-01T10:00:00Z",
      "service": {
        "id": "uuid",
        "name": "Организация похорон под ключ",
        "vendor": {
          "businessName": "Ритуальные услуги АИ"
        }
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Implementation

```typescript
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
async getMyOrders(
  @CurrentUser() user: User,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('status') status?: OrderStatus,
) {
  const where: Prisma.OrderWhereInput = { clientId: user.id };
  if (status) where.status = status;
  
  const [data, total] = await Promise.all([
    this.prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            vendor: { select: { businessName: true } },
          },
        },
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

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

