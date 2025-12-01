# Docker Setup - Memento Mori

Все сервисы теперь запускаются в Docker.

## Сервисы

- **Server (Backend API)**: `http://localhost:3001`
- **Client (Frontend)**: `http://localhost:3000`
- **Admin Portal**: `http://localhost:3003`

## Запуск всех сервисов

```bash
# Запустить все сервисы
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановить все сервисы
docker-compose down

# Пересобрать и запустить
docker-compose up -d --build
```

## Запуск отдельных сервисов

```bash
# Только бэкенд
docker-compose up -d server

# Только клиент
docker-compose up -d client

# Только админ-портал
docker-compose up -d admin-portal
```

## Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f admin-portal
docker-compose logs -f server
docker-compose logs -f client
```

## Перезапуск сервиса

```bash
# Перезапустить админ-портал
docker-compose restart admin-portal

# Перезапустить все
docker-compose restart
```

## Очистка

```bash
# Остановить и удалить контейнеры
docker-compose down

# Остановить, удалить контейнеры и volumes
docker-compose down -v

# Удалить образы
docker-compose down --rmi all
```

## Учётные данные для админ-портала

**Email:** `admin@memento-mori.com`  
**Пароль:** `zPim^&LND5!TcOm@`

(См. файл `ADMIN_CREDENTIALS.md`)

## Структура сети

Все сервисы находятся в одной Docker сети `memento-mori-network` и могут общаться друг с другом по именам сервисов:

- `server:3001` - Backend API
- `client:3000` - Frontend
- `admin-portal:3003` - Admin Portal

**Важно:** В браузере всегда используется `http://localhost:3001` для API, так как браузер работает на хосте, а не внутри Docker сети.

