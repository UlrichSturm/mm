# Разработка с Hot Reload

## Быстрый старт для разработки

Для разработки с автоматической перезагрузкой при изменении файлов используйте:

```bash
# Остановите текущие контейнеры (если запущены)
docker-compose down

# Запустите в режиме разработки
docker-compose -f docker-compose.dev.yml up --build
```

## Что изменилось?

### Режим разработки (`docker-compose.dev.yml`)
- ✅ **Volume mounts** - изменения в коде сразу видны в контейнере
- ✅ **Hot reload** - Next.js автоматически перезагружает страницу при изменениях
- ✅ **Development режим** - более подробные ошибки и логи
- ✅ **Быстрая разработка** - не нужно пересобирать образ при каждом изменении

### Production режим (`docker-compose.yml`)
- Используется для продакшена
- Оптимизированный билд
- Без volume mounts (код копируется в образ)

## Команды

### Запуск в режиме разработки
```bash
docker-compose -f docker-compose.dev.yml up
```

### Остановка
```bash
docker-compose -f docker-compose.dev.yml down
```

### Пересборка (только при изменении зависимостей)
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Просмотр логов
```bash
docker-compose -f docker-compose.dev.yml logs -f client
```

## Примечания

- Изменения в `src/` применяются автоматически без перезапуска
- Изменения в `package.json` требуют пересборки: `docker-compose -f docker-compose.dev.yml up --build`
- Изменения в конфигурационных файлах (next.config.js, tailwind.config.js) применяются автоматически



