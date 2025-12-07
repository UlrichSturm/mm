# Быстрая настройка Mailgun для Keycloak

## Шаг 1: Получение данных Mailgun

### Вариант A: Использование Sandbox (для тестов)

1. Зарегистрируйтесь на https://mailgun.com
2. В Dashboard перейдите в **Sending** → **Domain Settings**
3. Найдите ваш sandbox domain (например: `sandbox.xxxxx.mailgun.org`)
4. Перейдите в **SMTP credentials**
5. Скопируйте:
   - **SMTP Username**: `postmaster@sandbox.xxxxx.mailgun.org`
   - **SMTP Password**: (показывается один раз при создании)

**Важно:** Sandbox может отправлять email только на адреса, добавленные в **Authorized Recipients** в Mailgun Dashboard.

### Вариант B: Использование собственного домена (для продакшена)

1. Добавьте домен в Mailgun (например: `mail.mementomori.ru`)
2. Настройте DNS записи (SPF, DKIM) как указано в Mailgun
3. После верификации используйте:
   - **SMTP Username**: `postmaster@mail.mementomori.ru`
   - **SMTP Password**: ваш SMTP password

## Шаг 2: Настройка через скрипт

### Интерактивная настройка:

```bash
./scripts/quick-setup-mailgun.sh
```

Скрипт запросит:
- Mailgun SMTP Username
- Mailgun SMTP Password
- Email отправителя
- Имя отправителя

### Настройка через переменные окружения:

```bash
export MAILGUN_SMTP_USER="postmaster@sandbox.xxxxx.mailgun.org"
export MAILGUN_SMTP_PASSWORD="your-smtp-password"
export MAILGUN_FROM="noreply@mementomori.ru"
export MAILGUN_FROM_DISPLAY="Memento Mori"

./scripts/setup-keycloak-mailgun.sh
```

## Шаг 3: Проверка настройки

1. Откройте Keycloak Admin Console: http://localhost:8080
2. Войдите: admin / admin
3. Выберите realm `memento-mori`
4. Перейдите в **Realm settings** → **Email**
5. Проверьте настройки SMTP
6. Нажмите **Test connection** и введите тестовый email

## Шаг 4: Тестирование

### Тест 1: Отправка email подтверждения

1. Создайте пользователя через регистрацию:
   ```bash
   curl -X POST http://localhost:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
   ```

2. В Keycloak Admin Console:
   - Перейдите в **Users** → найдите пользователя
   - На вкладке **Credentials** → **Send email** → **Send verification email**

3. Проверьте получение email

### Тест 2: Сброс пароля

1. В Keycloak Admin Console → **Users** → выберите пользователя
2. **Send email** → **Send reset password**
3. Проверьте получение email со ссылкой на сброс пароля

## Настройки по умолчанию

- **SMTP Host**: `smtp.mailgun.org`
- **SMTP Port**: `587` (StartTLS)
- **SSL**: `false`
- **StartTLS**: `true`
- **Authentication**: `true`

## Troubleshooting

### Email не отправляется

1. **Проверьте логи Keycloak:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs keycloak | grep -i email
   ```

2. **Проверьте настройки в Keycloak Admin Console:**
   - Realm settings → Email
   - Убедитесь, что все поля заполнены правильно

3. **Для Sandbox domain:**
   - Убедитесь, что email адрес получателя добавлен в **Authorized Recipients** в Mailgun Dashboard
   - Sandbox может отправлять только на авторизованные адреса

4. **Проверьте Mailgun Dashboard:**
   - Перейдите в **Sending** → **Logs**
   - Проверьте статус отправки email

### Ошибка аутентификации

- Проверьте правильность SMTP username и password
- Убедитесь, что используете правильный формат username (например: `postmaster@domain.mailgun.org`)

### Email попадает в спам

- Настройте SPF и DKIM записи для вашего домена
- Используйте верифицированный домен вместо sandbox
- Добавьте обратный DNS (rDNS) для вашего IP адреса

## Дополнительная информация

- Подробная инструкция: `MAILGUN_KEYCLOAK_SETUP.md`
- Mailgun Documentation: https://documentation.mailgun.com/
- Keycloak Email Docs: https://www.keycloak.org/docs/latest/server_admin/#_email

