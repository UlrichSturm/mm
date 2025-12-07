# Настройка Mailgun для Keycloak

## Обзор

Mailgun настроен для отправки email уведомлений через Keycloak. Это позволяет Keycloak отправлять:
- Email подтверждения регистрации
- Уведомления о сбросе пароля
- Другие системные уведомления

## Получение данных Mailgun

### 1. Создайте аккаунт Mailgun

1. Зарегистрируйтесь на https://mailgun.com
2. Добавьте домен (для тестов можно использовать sandbox domain)
3. Получите SMTP credentials:
   - **SMTP Hostname**: `smtp.mailgun.org`
   - **SMTP Port**: `587` (или `465` для SSL)
   - **SMTP Username**: ваш SMTP username (обычно `postmaster@your-domain.mailgun.org`)
   - **SMTP Password**: ваш SMTP password

### 2. Для тестирования (Sandbox)

Mailgun предоставляет sandbox domain для тестирования:
- **Domain**: `sandbox.xxxxx.mailgun.org`
- **SMTP Username**: `postmaster@sandbox.xxxxx.mailgun.org`
- **SMTP Password**: можно найти в настройках домена

**Важно:** Sandbox domain может отправлять email только на адреса, добавленные в список получателей в Mailgun Dashboard.

## Настройка через скрипт

### Автоматическая настройка:

```bash
# Установите переменные окружения
export MAILGUN_SMTP_USER="postmaster@sandbox.xxxxx.mailgun.org"
export MAILGUN_SMTP_PASSWORD="your-smtp-password"
export MAILGUN_FROM="noreply@mementomori.ru"
export MAILGUN_FROM_DISPLAY="Memento Mori"

# Запустите скрипт
./scripts/setup-keycloak-mailgun.sh
```

## Настройка вручную через Keycloak Admin Console

1. Откройте http://localhost:8080
2. Войдите как администратор (admin/admin)
3. Выберите realm `memento-mori`
4. Перейдите в **Realm settings** → **Email**
5. Заполните настройки:

   **Host:** `smtp.mailgun.org`  
   **Port:** `587`  
   **From:** `noreply@mementomori.ru`  
   **From Display Name:** `Memento Mori`  
   **Reply To:** `noreply@mementomori.ru`  
   **Reply To Display Name:** `Memento Mori`  
   **Enable StartTLS:** `On`  
   **Enable Authentication:** `On`  
   **Username:** `postmaster@sandbox.xxxxx.mailgun.org`  
   **Password:** `your-smtp-password`  

6. Нажмите **Save**
7. Нажмите **Test connection** для проверки

## Настройка через API

Скрипт `scripts/setup-keycloak-mailgun.sh` автоматически настраивает Mailgun через Keycloak Admin API.

## Переменные окружения

Для автоматической настройки можно добавить в `docker-compose.dev.yml`:

```yaml
keycloak:
  environment:
    - MAILGUN_SMTP_USER=postmaster@sandbox.xxxxx.mailgun.org
    - MAILGUN_SMTP_PASSWORD=your-smtp-password
    - MAILGUN_FROM=noreply@mementomori.ru
    - MAILGUN_FROM_DISPLAY=Memento Mori
```

## Тестирование

### 1. Тест подключения в Keycloak

1. В Keycloak Admin Console → Realm settings → Email
2. Нажмите **Test connection**
3. Введите тестовый email адрес
4. Проверьте получение email

### 2. Тест отправки email пользователю

1. Создайте тестового пользователя в Keycloak
2. Перейдите в **Users** → выберите пользователя
3. На вкладке **Credentials** нажмите **Send email** → **Send verification email**
4. Проверьте получение email

### 3. Тест через API

```bash
# Создайте пользователя
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'

# Keycloak должен отправить email подтверждения (если включено)
```

## Настройка email шаблонов

Keycloak использует встроенные шаблоны email. Можно настроить:

1. **Realm settings** → **Email** → **Theme**
2. Выберите тему или создайте кастомную
3. Настройте шаблоны в `themes/your-theme/email/`

## Troubleshooting

### Email не отправляется

1. Проверьте настройки SMTP в Keycloak
2. Проверьте логи Keycloak: `docker-compose -f docker-compose.dev.yml logs keycloak | grep -i email`
3. Убедитесь, что Mailgun credentials правильные
4. Для sandbox domain - проверьте, что email адрес добавлен в список получателей

### Ошибка аутентификации

- Проверьте SMTP username и password
- Убедитесь, что используется правильный порт (587 для StartTLS, 465 для SSL)

### Email попадает в спам

- Настройте SPF, DKIM записи для вашего домена в Mailgun
- Используйте верифицированный домен вместо sandbox

## Полезные ссылки

- Mailgun Documentation: https://documentation.mailgun.com/
- Keycloak Email Configuration: https://www.keycloak.org/docs/latest/server_admin/#_email
- Mailgun SMTP Settings: https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp

