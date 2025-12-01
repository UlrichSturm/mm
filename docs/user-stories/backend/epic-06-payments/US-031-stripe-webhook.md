# US-031: Обработка Stripe Webhook

**Epic:** E-006 Payments  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна обрабатывать события от Stripe

---

## Acceptance Criteria

- [ ] Endpoint `POST /payments/webhook` публичный
- [ ] Верификация подписи Stripe
- [ ] Обработка payment_intent.succeeded
- [ ] Обработка payment_intent.payment_failed
- [ ] Идемпотентность (повторные события не ломают систему)

---

## API Specification

### Request

```http
POST /payments/webhook
Stripe-Signature: t=xxx,v1=xxx
Content-Type: application/json

{
  "id": "evt_xxx",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 4500000,
      "status": "succeeded"
    }
  }
}
```

### Response (Success - 200)

```json
{
  "received": true
}
```

---

## Handled Events

| Event | Action |
|-------|--------|
| payment_intent.succeeded | Payment → COMPLETED, Order → CONFIRMED |
| payment_intent.payment_failed | Payment → FAILED, log error |
| payment_intent.canceled | Payment → FAILED |

---

## Implementation

```typescript
@Post('webhook')
@HttpCode(200)
async handleWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('stripe-signature') signature: string,
) {
  let event: Stripe.Event;
  
  try {
    event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET'),
    );
  } catch (err) {
    throw new BadRequestException(`Webhook signature verification failed`);
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
  }
  
  return { received: true };
}

private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const payment = await this.prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });
  
  if (!payment || payment.status === 'COMPLETED') return; // Idempotent
  
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
}
```

---

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Dependencies

- US-029 (Payment Intent)
- Stripe SDK

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Stripe webhook тестирование пройдено
- [ ] Идемпотентность проверена
- [ ] API документация обновлена
- [ ] Code review пройден

