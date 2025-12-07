# Настройка Mailgun для Epic 8: Email Notifications

**Дата:** 2025-12-03

---

## 📋 Необходимые переменные окружения

Для работы с Mailgun SMTP нужны следующие переменные:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
EMAIL_FROM=Memento Mori <noreply@mementomori.de>
APP_URL=http://localhost:3000
```

---

## 🔧 Шаги настройки Mailgun

### 1. Войти в Mailgun Dashboard

1. Откройте https://app.mailgun.com/
2. Войдите в свой аккаунт (или создайте новый)

### 2. Выбрать домен

1. В Dashboard выберите домен (или создайте новый)
2. Если используете Sandbox домен (для тестирования):
   - Mailgun предоставляет бесплатный sandbox домен
   - Например: `sandbox1234567890.mailgun.org`
   - Ограничение: можно отправлять только на зарегистрированные email адреса

### 3. Получить SMTP credentials

1. Перейдите в **Sending** → **Domain Settings**
2. Найдите секцию **SMTP credentials**
3. Скопируйте:
   - **SMTP hostname**: `smtp.mailgun.org`
   - **Port**: `587` (TLS) или `465` (SSL)
   - **Username**: обычно `postmaster@your-domain.mailgun.org`
   - **Password**: нажмите "Reset password" если нужно

### 4. Добавить переменные в .env

Добавьте в `.env` файл:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@sandbox1234567890.mailgun.org
SMTP_PASS=your-actual-smtp-password-here
EMAIL_FROM=Memento Mori <noreply@mementomori.de>
APP_URL=http://localhost:3000
```

### 5. Обновить docker-compose.yml

Добавьте переменные в секцию `server`:

```yaml
server:
  environment:
    # ... existing variables ...
    SMTP_HOST: ${SMTP_HOST:-smtp.mailgun.org}
    SMTP_PORT: ${SMTP_PORT:-587}
    SMTP_SECURE: ${SMTP_SECURE:-false}
    SMTP_USER: ${SMTP_USER}
    SMTP_PASS: ${SMTP_PASS}
    EMAIL_FROM: ${EMAIL_FROM:-Memento Mori <noreply@mementomori.de>}
    APP_URL: ${APP_URL:-http://localhost:3000}
```

### 6. Перезапустить сервер

```bash
docker-compose restart server
```

---

## 🧪 Тестирование

### Тест 1: Welcome Email (Регистрация)

1. Откройте Swagger UI: http://localhost:3001/api/docs
2. Выполните `POST /api/auth/register`:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "firstName": "Test",
     "lastName": "User"
   }
   ```
3. Проверьте логи сервера:
   ```bash
   docker-compose logs -f server | grep -i email
   ```
4. Проверьте почтовый ящик `test@example.com` (если используете sandbox, добавьте email в Mailgun)

### Тест 2: Order Confirmation

1. Создайте заказ через `POST /api/orders`
2. Проверьте логи и почтовый ящик клиента

### Тест 3: Order Status Update

1. Измените статус заказа через `PATCH /api/orders/:id/status`
2. Проверьте логи и почтовый ящик

---

## 📝 Примечания

### Sandbox Domain

- Mailgun предоставляет бесплатный sandbox домен для тестирования
- Можно отправлять только на зарегистрированные email адреса
- Для продакшена нужен собственный домен

### Лимиты

- Free tier: 5,000 emails/month
- Первые 3 месяца: 5,000 emails/month бесплатно

### Проверка SPF/DKIM

Для продакшена необходимо настроить:

- SPF record
- DKIM record
- DMARC (опционально)

---

**Последнее обновление:** 2025-12-03
