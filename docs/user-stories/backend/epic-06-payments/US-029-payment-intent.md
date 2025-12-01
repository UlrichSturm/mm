# US-029: Создание Payment Intent

**Epic:** E-006 Payments  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 4  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу инициировать платеж, чтобы оплатить заказ

---

## Acceptance Criteria

- [ ] Endpoint `POST /payments/intent` доступен CLIENT
- [ ] Создает Stripe Payment Intent
- [ ] Возвращает clientSecret для Stripe Elements
- [ ] Связывает Payment с Order
- [ ] Проверяет что заказ принадлежит клиенту
- [ ] Проверяет что заказ не оплачен

---

## API Specification

### Request

```http
POST /payments/intent
Authorization: Bearer <client-token>
Content-Type: application/json

{
  "orderId": "uuid"
}
```

### Response (Success - 201)

```json
{
  "paymentId": "uuid",
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 45000,
  "currency": "rub"
}
```

---

## Database Schema

```prisma
model Payment {
  id              String        @id @default(uuid())
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id])
  
  stripePaymentId String?
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("rub")
  
  status          PaymentStatus @default(PENDING)
  
  paidAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

## Implementation

```typescript
@Post('intent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
async createPaymentIntent(
  @CurrentUser() user: User,
  @Body() dto: CreatePaymentIntentDto,
) {
  const order = await this.prisma.order.findUnique({
    where: { id: dto.orderId },
    include: { payment: true },
  });
  
  if (!order) throw new NotFoundException('Order not found');
  if (order.clientId !== user.id) throw new ForbiddenException('Access denied');
  if (order.payment?.status === 'COMPLETED') {
    throw new BadRequestException('Order already paid');
  }
  
  // Create Stripe Payment Intent
  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice.toNumber() * 100), // kopeks
    currency: 'rub',
    metadata: { orderId: order.id, clientId: user.id },
  });
  
  // Create or update Payment record
  const payment = await this.prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      stripePaymentId: paymentIntent.id,
      amount: order.totalPrice,
      currency: 'rub',
    },
    update: {
      stripePaymentId: paymentIntent.id,
      status: 'PENDING',
    },
  });
  
  return {
    paymentId: payment.id,
    clientSecret: paymentIntent.client_secret,
    amount: order.totalPrice.toNumber(),
    currency: 'rub',
  };
}
```

---

## Dependencies

- US-005 (RBAC)
- US-023 (Order model)
- Stripe SDK

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] Stripe test mode проверен
- [ ] API документация обновлена
- [ ] Code review пройден

