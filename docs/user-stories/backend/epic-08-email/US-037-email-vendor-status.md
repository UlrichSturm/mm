# US-037: Email при изменении статуса Vendor

**Epic:** E-008 Email Notifications  
**Portal:** Backend  
**Приоритет:** 🟢 Could Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна отправить email при модерации поставщика

---

## Acceptance Criteria

- [ ] Approved email при одобрении
- [ ] Rejected email при отклонении (с причиной)
- [ ] Email содержит следующие шаги

---

## Email Templates

### Vendor Approved

**Subject:** Ваша заявка одобрена!

```html
<h1>Поздравляем, {{firstName}}!</h1>
<p>Ваша заявка на регистрацию в качестве поставщика одобрена.</p>
<p>Теперь вы можете:</p>
<ul>
  <li>Добавлять услуги в каталог</li>
  <li>Получать и обрабатывать заказы</li>
  <li>Управлять своим профилем</li>
</ul>
<a href="{{appUrl}}/vendor/services">Добавить первую услугу</a>
```

### Vendor Rejected

**Subject:** Заявка отклонена

```html
<h1>Здравствуйте, {{firstName}}!</h1>
<p>К сожалению, ваша заявка на регистрацию была отклонена.</p>
<p><strong>Причина:</strong> {{rejectionReason}}</p>
<p>Вы можете обновить данные профиля и подать заявку повторно.</p>
<a href="{{appUrl}}/vendor/profile">Обновить профиль</a>
```

---

## Implementation

```typescript
async sendVendorApprovedEmail(email: string, firstName: string) {
  await this.emailQueue.add('vendor-approved', {
    to: email,
    subject: 'Ваша заявка одобрена!',
    template: 'vendor-approved',
    context: { firstName, appUrl: this.configService.get('VENDOR_URL') },
  });
}

async sendVendorRejectedEmail(email: string, firstName: string, rejectionReason: string) {
  await this.emailQueue.add('vendor-rejected', {
    to: email,
    subject: 'Заявка отклонена',
    template: 'vendor-rejected',
    context: { firstName, rejectionReason, appUrl: this.configService.get('VENDOR_URL') },
  });
}
```

---

## Dependencies

- US-036 (Email module setup)
- US-009 (Vendor moderation)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Email шаблоны созданы
- [ ] Тестовая отправка успешна
- [ ] Code review пройден

