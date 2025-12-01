# Docker Setup для Memento Mori

## Быстрый старт

### Запуск через Docker Compose

```bash
# Запустить приложение
docker-compose up -d

# Просмотр логов
docker-compose logs -f client

# Остановить приложение
docker-compose down
```

Приложение будет доступно по адресу: http://localhost:3000

### Запуск через Docker напрямую

```bash
# Перейти в директорию клиента
cd apps/client

# Собрать образ
docker build -t memento-mori-client .

# Запустить контейнер
docker run -p 3000:3000 --name memento-mori-client memento-mori-client
```

## Переменные окружения

Создайте файл `.env` в корне проекта или в `apps/client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=production
```

## Разработка

Для разработки используйте локальный запуск:

```bash
cd apps/client
npm install
npm run dev
```

## Структура

- `apps/client/Dockerfile` - Multi-stage Dockerfile для production сборки
- `docker-compose.yml` - Конфигурация для запуска всех сервисов
- `apps/client/.dockerignore` - Исключения для Docker build

## Оптимизация

Dockerfile использует multi-stage build для минимизации размера образа:
1. **deps** - Установка зависимостей
2. **builder** - Сборка Next.js приложения
3. **runner** - Production образ с минимальными зависимостями

Итоговый образ использует `standalone` режим Next.js для оптимального размера.

