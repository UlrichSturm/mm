# Как найти Authorized Recipients в Mailgun

## Вариант 1: Через настройки домена

1. Войдите в Mailgun Dashboard: https://app.mailgun.com
2. В левом меню найдите **"Sending"** → **"Domain settings"**
3. Выберите ваш sandbox domain: `sandboxe001d498458247eb9510fd6af0bdd3d7.mailgun.org`
4. В настройках домена найдите вкладку **"Authorized Recipients"** (может быть рядом с "SMTP credentials")

## Вариант 2: Прямой URL

Попробуйте открыть напрямую:
```
https://app.mailgun.com/mg/sending/sandboxe001d498458247eb9510fd6af0bdd3d7.mailgun.org/authorized_recipients
```

## Вариант 3: Через Sending → Suppressions

1. В левом меню: **"Sending"** → **"Suppressions"**
2. Там может быть раздел для управления получателями

## Вариант 4: В настройках домена

1. **Sending** → **Domain settings**
2. Выберите домен
3. Посмотрите все вкладки: Settings, DNS records, SMTP credentials, **Authorized Recipients**, Sending keys, Setup

## Если раздела нет

Возможно, для вашего аккаунта Mailgun:
- Раздел называется по-другому
- Или находится в другом месте
- Или для sandbox domain это не требуется (но это маловероятно)

## Альтернатива: Тестирование

Попробуйте зарегистрировать пользователя и проверить, придет ли письмо. Mailgun может автоматически разрешить отправку на первый адрес или показать ошибку с инструкциями.

