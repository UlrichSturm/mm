# Настройка Keycloak для Memento Mori

## Обзор

Keycloak интегрирован в проект для управления пользователями, аутентификацией и авторизацией. Это позволяет централизованно управлять пользователями и их ролями.

## Запуск Keycloak

Keycloak автоматически запускается вместе с другими сервисами через Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up -d keycloak
```

Keycloak будет доступен по адресу: **http://localhost:8080**

## Первоначальная настройка

### 1. Вход в административную консоль

1. Откройте http://localhost:8080
2. Нажмите "Administration Console"
3. Войдите с учетными данными:
   - **Username**: `admin`
   - **Password**: `admin`

### 2. Создание Realm

1. В левом верхнем углу нажмите на выпадающий список (по умолчанию "master")
2. Нажмите "Create Realm"
3. Введите имя: `memento-mori`
4. Нажмите "Create"

### 3. Создание клиента для Backend API

1. В меню слева выберите "Clients"
2. Нажмите "Create client"
3. Заполните:
   - **Client type**: `OpenID Connect`
   - **Client ID**: `memento-mori-backend`
   - Нажмите "Next"
4. Настройте:
   - **Client authentication**: `On` (включить)
   - **Authorization**: `Off`
   - **Authentication flow**: `Standard flow`
   - Нажмите "Next"
5. Настройте URLs:
   - **Root URL**: `http://localhost:3001`
   - **Valid redirect URIs**: `http://localhost:3001/*`
   - **Web origins**: `http://localhost:3000`, `http://localhost:3002`, `http://localhost:3003`
   - Нажмите "Save"
6. Перейдите на вкладку "Credentials"
7. Скопируйте **Client secret** и добавьте его в переменные окружения:
   ```env
   KEYCLOAK_CLIENT_SECRET=your-client-secret-here
   ```

### 4. Создание клиентов для Frontend приложений

Для каждого frontend приложения (client, admin-portal, vendor-portal) создайте отдельный клиент:

#### Client (Frontend)
- **Client ID**: `memento-mori-client`
- **Client authentication**: `Off` (публичный клиент)
- **Valid redirect URIs**: `http://localhost:3000/*`
- **Web origins**: `http://localhost:3000`

#### Admin Portal
- **Client ID**: `memento-mori-admin-portal`
- **Client authentication**: `Off` (публичный клиент)
- **Valid redirect URIs**: `http://localhost:3003/*`
- **Web origins**: `http://localhost:3003`

#### Vendor Portal
- **Client ID**: `memento-mori-vendor-portal`
- **Client authentication**: `Off` (публичный клиент)
- **Valid redirect URIs**: `http://localhost:3002/*`
- **Web origins**: `http://localhost:3002`

### 5. Создание ролей

1. В меню слева выберите "Realm roles"
2. Создайте следующие роли:
   - `client`
   - `vendor`
   - `lawyer-notary`
   - `admin`

### 6. Настройка маппинга ролей

Роли Keycloak автоматически маппятся на роли приложения:
- `client` → `CLIENT`
- `vendor` → `VENDOR`
- `lawyer-notary` → `LAWYER_NOTARY`
- `admin` → `ADMIN`

## Переменные окружения

Добавьте следующие переменные в `docker-compose.dev.yml` или `.env`:

```env
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret-here
```

## Создание пользователей

### Через Keycloak Admin Console

1. В меню слева выберите "Users"
2. Нажмите "Create new user"
3. Заполните:
   - **Username**: email пользователя
   - **Email**: email пользователя
   - **Email verified**: `On`
   - **Enabled**: `On`
4. Перейдите на вкладку "Credentials"
5. Установите пароль
6. Перейдите на вкладку "Role mapping"
7. Назначьте нужную роль (client, vendor, lawyer-notary, admin)

### Через API регистрации

Пользователи могут регистрироваться через API endpoint `/auth/register`. Пользователь автоматически создается в Keycloak и локальной базе данных.

## Интеграция с существующей системой

Система поддерживает гибридный режим:
- Если Keycloak доступен, используется аутентификация через Keycloak
- Если Keycloak недоступен, система автоматически переключается на локальную аутентификацию (для обратной совместимости)

## Проверка работы

1. Убедитесь, что Keycloak запущен:
   ```bash
   docker-compose -f docker-compose.dev.yml ps keycloak
   ```

2. Проверьте доступность:
   ```bash
   curl http://localhost:8080/health/ready
   ```

3. Создайте тестового пользователя через Keycloak Admin Console

4. Попробуйте войти через API:
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

## Полезные ссылки

- Keycloak Documentation: https://www.keycloak.org/documentation
- Keycloak Admin REST API: https://www.keycloak.org/docs-api/latest/rest-api/

## Troubleshooting

### Keycloak не запускается

Проверьте логи:
```bash
docker-compose -f docker-compose.dev.yml logs keycloak
```

Убедитесь, что PostgreSQL запущен и доступен.

### Ошибка аутентификации

1. Проверьте, что realm создан правильно
2. Убедитесь, что client secret правильный
3. Проверьте переменные окружения в контейнере server

### Пользователь не может войти

1. Проверьте, что пользователь создан в Keycloak
2. Убедитесь, что пароль установлен
3. Проверьте, что пользователь включен (Enabled = On)

