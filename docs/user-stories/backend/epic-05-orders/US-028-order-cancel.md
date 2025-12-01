# US-028: Отмена заказа

**Epic:** E-005 Orders  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу отменить заказ (если возможно)

---

## Acceptance Criteria

- [ ] Endpoint `PATCH /orders/:id/cancel` доступен CLIENT
- [ ] Только из статуса PENDING можно отменить
- [ ] Статус → CANCELLED
- [ ] Email уведомление vendor
- [ ] Возврат средств если оплачен (Phase 2)

---

## API Specification

### Request

```http
PATCH /orders/uuid/cancel
Authorization: Bearer <client-token>
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "status": "CANCELLED",
  "message": "Заказ отменен"
}
```

### Response (Error - 400)

```json
{
  "statusCode": 400,
  "message": "Cannot cancel order in current status",
  "error": "Bad Request"
}
```

---

## Implementation

```typescript
@Patch(':id/cancel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
async cancelOrder(
  @Param('id') id: string,
  @CurrentUser() user: User,
) {
  const order = await this.prisma.order.findUnique({
    where: { id },
    include: { service: { include: { vendor: { include: { user: true } } } } },
  });
  
  if (!order) throw new NotFoundException('Order not found');
  if (order.clientId !== user.id) throw new ForbiddenException('Access denied');
  
  if (order.status !== 'PENDING') {
    throw new BadRequestException('Cannot cancel order in current status');
  }
  
  const updated = await this.prisma.order.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
  
  // Notify vendor
  await this.emailService.sendOrderCancelledEmail(
    order.service.vendor.user.email,
    order
  );
  
  return { ...updated, message: 'Заказ отменен' };
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

