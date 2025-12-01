# US-032: История платежей

**Epic:** E-006 Payments  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть историю моих платежей

---

## Acceptance Criteria

- [ ] Endpoint `GET /payments` доступен CLIENT
- [ ] Фильтр по clientId (из токена)
- [ ] Пагинация
- [ ] Включает данные заказа и услуги

---

## API Specification

### Request

```http
GET /payments?page=1&limit=10
Authorization: Bearer <client-token>
```

### Response (Success - 200)

```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 45000,
      "currency": "rub",
      "status": "COMPLETED",
      "paidAt": "2025-12-01T11:00:00Z",
      "order": {
        "id": "uuid",
        "service": {
          "name": "Организация похорон под ключ"
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
async getMyPayments(
  @CurrentUser() user: User,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  const [data, total] = await Promise.all([
    this.prisma.payment.findMany({
      where: { order: { clientId: user.id } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            service: { select: { name: true } },
          },
        },
      },
    }),
    this.prisma.payment.count({ where: { order: { clientId: user.id } } }),
  ]);
  
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
```

---

## Dependencies

- US-005 (RBAC)
- US-029 (Payment model)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

