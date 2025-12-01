# US-027: Обновление статуса заказа

**Epic:** E-005 Orders  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу обновить статус заказа, чтобы информировать клиента

---

## Acceptance Criteria

- [ ] Endpoint `PATCH /orders/:id/status` доступен VENDOR
- [ ] Только vendor услуги может обновить статус
- [ ] Валидация переходов статусов
- [ ] Email уведомление клиенту
- [ ] Статусы: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED

---

## API Specification

### Request

```http
PATCH /orders/uuid/status
Authorization: Bearer <vendor-token>
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "updatedAt": "2025-12-01T12:00:00Z",
  "message": "Статус заказа обновлен"
}
```

---

## Status Transitions

```
PENDING → CONFIRMED ✅
CONFIRMED → IN_PROGRESS ✅
IN_PROGRESS → COMPLETED ✅
Any → CANCELLED ✅ (with conditions)
```

---

## Implementation

```typescript
@Patch(':id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
async updateOrderStatus(
  @Param('id') id: string,
  @CurrentUser() user: User,
  @Body() dto: UpdateOrderStatusDto,
) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  
  const order = await this.prisma.order.findUnique({
    where: { id },
    include: { service: true, client: true },
  });
  
  if (!order) throw new NotFoundException('Order not found');
  if (order.service.vendorId !== vendor.id) {
    throw new ForbiddenException('Access denied');
  }
  
  // Validate transition
  this.validateStatusTransition(order.status, dto.status);
  
  const updated = await this.prisma.order.update({
    where: { id },
    data: { status: dto.status },
  });
  
  // Send email
  await this.emailService.sendOrderStatusEmail(order.client.email, order, dto.status);
  
  return { ...updated, message: 'Статус заказа обновлен' };
}
```

---

## Dependencies

- US-005 (RBAC)
- US-023 (Order model)
- US-038 (Email notifications)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

