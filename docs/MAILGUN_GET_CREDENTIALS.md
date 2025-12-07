# Как получить SMTP credentials из Mailgun

## Шаг 1: Вход в Mailgun Dashboard

1. Откройте https://app.mailgun.com
2. Войдите с вашими данными:
   - **Email**: `ulrichsturm@icloud.com`
   - **Password**: `toBvaz-vujcoq-kumzo8`

## Шаг 2: Найти SMTP credentials

### Вариант A: Использование Sandbox Domain (для тестов)

1. В Dashboard перейдите в **Sending** → **Domain Settings**
2. Найдите ваш **sandbox domain** (например: `sandbox.xxxxx.mailgun.org`)
3. Перейдите в раздел **SMTP credentials**
4. Скопируйте:
   - **SMTP Username**: обычно `postmaster@sandbox.xxxxx.mailgun.org`
   - **SMTP Password**: (показывается один раз при создании)

**Важно:** Sandbox может отправлять email только на адреса, добавленные в **Authorized Recipients**.

### Вариант B: Использование собственного домена

1. В Dashboard перейдите в **Sending** → **Domain Settings**
2. Выберите ваш домен (например: `mail.mementomori.ru`)
3. Перейдите в **SMTP credentials**
4. Если SMTP пользователь не создан:
   - Нажмите **Create SMTP credentials**
   - Введите имя пользователя
   - Скопируйте пароль (показывается один раз!)
5. Скопируйте:
   - **SMTP Username**: например `postmaster@mail.mementomori.ru`
   - **SMTP Password**: ваш SMTP пароль

## Шаг 3: Настройка Keycloak

После получения SMTP credentials, используйте один из скриптов:

### Интерактивная настройка:
```bash
./scripts/quick-setup-mailgun.sh
```

### Через переменные окружения:
```bash
export MAILGUN_SMTP_USER="postmaster@sandbox.xxxxx.mailgun.org"
export MAILGUN_SMTP_PASSWORD="your-smtp-password"
export MAILGUN_FROM="noreply@mementomori.ru"

./scripts/fix-keycloak-mailgun.sh
```

## Важные замечания

1. **SMTP Username** - это НЕ ваш email для входа в Mailgun
2. **SMTP Password** - это НЕ ваш пароль от аккаунта Mailgun
3. SMTP credentials создаются отдельно в разделе Domain Settings
4. Для sandbox domain нужно добавить получателей в **Authorized Recipients**

## Проверка настроек

После настройки проверьте:
1. Keycloak Admin Console → Realm settings → Email
2. Нажмите **Test connection**
3. Введите тестовый email адрес
4. Проверьте получение email

