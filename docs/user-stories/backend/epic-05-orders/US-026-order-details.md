# US-026: Детали заказа

**Epic:** E-005 Orders  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как пользователь**, я хочу видеть детали заказа

---

## Acceptance Criteria

- [ ] Endpoint `GET /orders/:id` доступен авторизованным
- [ ] Включает данные услуги и поставщика
- [ ] Проверка доступа: только owner (client) или vendor услуги
- [ ] 404 если заказ не найден
- [ ] 403 если нет доступа

---

## API Specification

### Request

```http
GET /orders/uuid
Authorization: Bearer <token>
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "clientId": "uuid",
  "serviceId": "uuid",
  "quantity": 1,
  "totalPrice": 45000,
  "notes": "Нужна доставка до 12:00",
  "status": "CONFIRMED",
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2025-12-01T12:00:00Z",
  "service": {
    "id": "uuid",
    "name": "Организация похорон под ключ",
    "description": "Полный комплекс услуг...",
    "price": 45000
  },
  "vendor": {
    "id": "uuid",
    "businessName": "Ритуальные услуги АИ",
    "contactPhone": "+7 999 123-45-67"
  },
  "client": {
    "id": "uuid",
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "client@example.com"
  },
  "payment": {
    "id": "uuid",
    "status": "COMPLETED",
    "paidAt": "2025-12-01T11:00:00Z"
  }
}
```

---

## Implementation

```typescript
@Get(':id')
@UseGuards(JwtAuthGuard)
async getOrder(
  @Param('id') id: string,
  @CurrentUser() user: User,
) {
  const order = await this.prisma.order.findUnique({
    where: { id },
    include: {
      service: {
        include: {
          vendor: { select: { id: true, businessName: true, contactPhone: true } },
        },
      },
      client: { select: { id: true, firstName: true, lastName: true, email: true } },
      payment: true,
    },
  });
  
  if (!order) {
    throw new NotFoundException('Order not found');
  }
  
  // Check access: client owner or service vendor
  const isClient = order.clientId === user.id;
  const isVendor = user.role === 'VENDOR' && 
    order.service.vendor.id === (await this.getVendorId(user.id));
  const isAdmin = user.role === 'ADMIN';
  
  if (!isClient && !isVendor && !isAdmin) {
    throw new ForbiddenException('Access denied');
  }
  
  return order;
}
```

---

## Dependencies

- US-006 (JWT Guard)
- US-023 (Order model)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

