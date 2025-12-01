# US-038: Email при изменении статуса заказа

**Epic:** E-008 Email Notifications  
**Portal:** Backend  
**Приоритет:** 🟢 Could Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна отправить email о статусе заказа

---

## Acceptance Criteria

- [ ] Email клиенту при изменении статуса заказа
- [ ] Email vendor при новом заказе
- [ ] Email при отмене заказа

---

## Email Templates

### New Order (to Vendor)

**Subject:** Новый заказ #{{orderId}}

```html
<h1>Новый заказ!</h1>
<p>Вы получили новый заказ на услугу: <strong>{{serviceName}}</strong></p>
<p>Клиент: {{clientName}}</p>
<p>Сумма: {{totalPrice}} ₽</p>
<a href="{{vendorUrl}}/orders/{{orderId}}">Просмотреть заказ</a>
```

### Order Status Update (to Client)

**Subject:** Статус заказа #{{orderId}} обновлен

```html
<h1>Статус вашего заказа обновлен</h1>
<p>Заказ: <strong>{{serviceName}}</strong></p>
<p>Новый статус: <strong>{{status}}</strong></p>
<a href="{{clientUrl}}/orders/{{orderId}}">Просмотреть заказ</a>
```

### Order Cancelled (to Vendor)

**Subject:** Заказ #{{orderId}} отменен

```html
<h1>Заказ отменен</h1>
<p>Клиент отменил заказ на услугу: <strong>{{serviceName}}</strong></p>
```

---

## Implementation

```typescript
async sendNewOrderEmail(vendorEmail: string, order: Order) {
  await this.emailQueue.add('new-order', {
    to: vendorEmail,
    subject: `Новый заказ #${order.id.slice(0, 8)}`,
    template: 'new-order',
    context: {
      orderId: order.id.slice(0, 8),
      serviceName: order.service.name,
      clientName: `${order.client.firstName} ${order.client.lastName}`,
      totalPrice: order.totalPrice,
      vendorUrl: this.configService.get('VENDOR_URL'),
    },
  });
}

async sendOrderStatusEmail(clientEmail: string, order: Order, status: string) {
  const statusMap = {
    CONFIRMED: 'Подтвержден',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Выполнен',
    CANCELLED: 'Отменен',
  };
  
  await this.emailQueue.add('order-status', {
    to: clientEmail,
    subject: `Статус заказа #${order.id.slice(0, 8)} обновлен`,
    template: 'order-status',
    context: {
      orderId: order.id.slice(0, 8),
      serviceName: order.service.name,
      status: statusMap[status],
      clientUrl: this.configService.get('CLIENT_URL'),
    },
  });
}
```

---

## Dependencies

- US-036 (Email module setup)
- US-027 (Order status update)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Email шаблоны созданы
- [ ] Тестовая отправка успешна
- [ ] Code review пройден

