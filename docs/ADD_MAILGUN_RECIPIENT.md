# Добавление получателя в Mailgun Authorized Recipients

## Шаг 1: Вход в Mailgun Dashboard

1. Откройте: https://app.mailgun.com
2. Войдите с вашими данными:
   - **Email**: `ulrichsturm@icloud.com`
   - **Password**: `toBvaz-vujcoq-kumzo8`

## Шаг 2: Добавление получателя

1. В левом меню нажмите **"Sending"**
2. Выберите **"Authorized Recipients"** (или перейдите напрямую по ссылке)
3. Нажмите кнопку **"Add Recipient"** или **"Add"**
4. Введите email адрес: `ulrichsturm@icloud.com`
5. Нажмите **"Add"** или **"Save"**

## Шаг 3: Подтверждение

1. Mailgun отправит письмо подтверждения на `ulrichsturm@icloud.com`
2. Откройте письмо и нажмите на ссылку подтверждения
3. После подтверждения получатель будет добавлен в список

## Проверка

После добавления получателя:
- Email `ulrichsturm@icloud.com` появится в списке Authorized Recipients
- Статус будет "verified" после подтверждения
- Keycloak сможет отправлять письма на этот адрес

## Тестирование

1. Зарегистрируйте пользователя: http://localhost:3000/auth/register
2. Используйте email: `ulrichsturm@icloud.com`
3. Проверьте почту - должно прийти письмо подтверждения от Keycloak

## Примечание

Для sandbox domain Mailgun можно отправлять письма **только** на адреса, добавленные в Authorized Recipients. Это ограничение sandbox domain для предотвращения спама.

