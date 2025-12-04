# Epic 8: Mailgun SSL Configuration Issue

**Дата:** 2025-12-03

---

## Проблема

При попытке отправки email через Mailgun SMTP возникает ошибка:

```
error:0A00010B:SSL routines:ssl3_get_record:wrong version number
```

## Текущая конфигурация

- **SMTP_HOST:** `smtp.mailgun.org`
- **SMTP_PORT:** `587` (STARTTLS)
- **SMTP_USER:** `postmaster@sandboxe001d498458247eb9510fd6af0bdd3d7.mailgun.org`
- **SMTP_PASS:** `***REDACTED***`
- **SMTP_SECURE:** `false`

## Попытки решения

1. ✅ Использование `secure: false` для порта 587
2. ✅ Использование `requireTLS: true` для STARTTLS
3. ✅ Использование `ignoreTLS: true` для порта 2525
4. ✅ Использование строки подключения `smtp://...`
5. ✅ Использование порта 2525 (plain SMTP)
6. ✅ Использование `tls: { rejectUnauthorized: false }`

Все попытки приводят к той же ошибке SSL.

## Возможные причины

1. **Проблема в `@nestjs-modules/mailer`:** Модуль может неправильно передавать опции в nodemailer
2. **Проблема в nodemailer:** Автоматически пытается использовать SSL, даже когда `secure: false`
3. **Проблема в версии nodemailer:** Текущая версия `^7.0.11` может иметь баг
4. **Проблема в Docker окружении:** OpenSSL в Alpine Linux может иметь проблемы с STARTTLS

## Рекомендации

### Вариант 1: Использовать Mailgun API вместо SMTP

Mailgun предоставляет REST API для отправки email, который не требует SMTP конфигурации:

```typescript
// Использовать Mailgun API напрямую через axios
const response = await axios.post(
  `https://api.mailgun.net/v3/${domain}/messages`,
  {
    from: 'Memento Mori <noreply@mementomori.de>',
    to: email,
    subject: subject,
    html: htmlContent,
  },
  {
    auth: {
      username: 'api',
      password: mailgunApiKey,
    },
  },
);
```

### Вариант 2: Обновить nodemailer

Попробовать обновить `nodemailer` до последней версии или использовать другую версию.

### Вариант 3: Использовать другой SMTP сервис

Для тестирования можно использовать другой SMTP сервис (например, SendGrid, AWS SES) или локальный SMTP сервер.

### Вариант 4: Проверить Mailgun Dashboard

Убедиться, что:

1. Sandbox домен правильно настроен
2. SMTP credentials правильные
3. Авторизованные получатели добавлены (для sandbox домена)

## Текущий статус

- ✅ Email модуль интегрирован во все необходимые модули
- ✅ Email шаблоны созданы и скопированы в Docker образ
- ✅ Конфигурация Mailgun настроена
- ❌ Отправка email не работает из-за SSL ошибки

## Следующие шаги

1. Попробовать использовать Mailgun API вместо SMTP
2. Или временно отключить отправку email для тестирования остальной функциональности
3. Или использовать другой SMTP сервис для тестирования

---

**Последнее обновление:** 2025-12-03
