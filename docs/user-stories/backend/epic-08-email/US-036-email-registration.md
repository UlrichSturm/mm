# US-036: Email при регистрации

**Epic:** E-008 Email Notifications  
**Portal:** Backend  
**Приоритет:** 🟢 Could Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна отправить email при регистрации

---

## Acceptance Criteria

- [ ] Welcome email для Client при регистрации
- [ ] Pending status email для Vendor при регистрации
- [ ] Email содержит имя пользователя
- [ ] Корректная кодировка (UTF-8)

---

## Email Templates

### Client Welcome

**Subject:** Добро пожаловать на Memento Mori!

```html
<h1>Добро пожаловать, {{firstName}}!</h1>
<p>Спасибо за регистрацию на платформе Memento Mori.</p>
<p>Теперь вы можете:</p>
<ul>
  <li>Просматривать каталог услуг</li>
  <li>Делать заказы</li>
  <li>Отслеживать статус заказов</li>
</ul>
<a href="{{appUrl}}/services">Перейти к каталогу</a>
```

### Vendor Pending

**Subject:** Заявка на регистрацию получена

```html
<h1>Здравствуйте, {{firstName}}!</h1>
<p>Ваша заявка на регистрацию в качестве поставщика получена.</p>
<p>Компания: <strong>{{businessName}}</strong></p>
<p>Статус: <strong>На модерации</strong></p>
<p>Мы рассмотрим вашу заявку в течение 24-48 часов и сообщим о результате.</p>
```

---

## Implementation

```typescript
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(email: string, firstName: string) {
    await this.emailQueue.add('welcome', {
      to: email,
      subject: 'Добро пожаловать на Memento Mori!',
      template: 'welcome',
      context: { firstName, appUrl: this.configService.get('APP_URL') },
    });
  }

  async sendVendorPendingEmail(email: string, firstName: string, businessName: string) {
    await this.emailQueue.add('vendor-pending', {
      to: email,
      subject: 'Заявка на регистрацию получена',
      template: 'vendor-pending',
      context: { firstName, businessName },
    });
  }
}
```

---

## Dependencies

- Mailgun or nodemailer
- Bull queue (для асинхронной отправки)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Email шаблоны созданы
- [ ] Тестовая отправка успешна
- [ ] Code review пройден

