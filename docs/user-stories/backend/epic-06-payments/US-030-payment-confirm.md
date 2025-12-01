# US-030: Подтверждение платежа

**Epic:** E-006 Payments  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна подтвердить платеж после успешной оплаты

---

## Acceptance Criteria

- [ ] Endpoint `POST /payments/confirm` обновляет статус
- [ ] Обновление статуса Payment → COMPLETED
- [ ] Обновление статуса Order → CONFIRMED
- [ ] Запись paidAt timestamp
- [ ] Email уведомления (client + vendor)

---

## API Specification

### Request

```http
POST /payments/confirm
Authorization: Bearer <client-token>
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

### Response (Success - 200)

```json
{
  "paymentId": "uuid",
  "status": "COMPLETED",
  "orderId": "uuid",
  "orderStatus": "CONFIRMED",
  "message": "Платеж успешно проведен"
}
```

---

## Implementation

```typescript
@Post('confirm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
async confirmPayment(
  @Body() dto: ConfirmPaymentDto,
) {
  // Verify with Stripe
  const paymentIntent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);
  
  if (paymentIntent.status !== 'succeeded') {
    throw new BadRequestException('Payment not successful');
  }
  
  const payment = await this.prisma.payment.findFirst({
    where: { stripePaymentId: dto.paymentIntentId },
    include: { order: { include: { client: true, service: { include: { vendor: { include: { user: true } } } } } } },
  });
  
  if (!payment) throw new NotFoundException('Payment not found');
  
  // Update payment and order
  await this.prisma.$transaction([
    this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    }),
    this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' },
    }),
  ]);
  
  // Send emails
  await Promise.all([
    this.emailService.sendPaymentConfirmation(payment.order.client.email, payment.order),
    this.emailService.sendNewOrderNotification(payment.order.service.vendor.user.email, payment.order),
  ]);
  
  return {
    paymentId: payment.id,
    status: 'COMPLETED',
    orderId: payment.orderId,
    orderStatus: 'CONFIRMED',
    message: 'Платеж успешно проведен',
  };
}
```

---

## Dependencies

- US-029 (Payment Intent)
- US-023 (Order model)
- US-038 (Email notifications)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] Stripe test mode проверен
- [ ] API документация обновлена
- [ ] Code review пройден

