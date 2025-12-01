# Обработка ошибок в Admin Portal

## Реализованные улучшения

### 1. Компонент ErrorDisplay

Улучшенный компонент для отображения ошибок с дополнительными возможностями:

**Функции:**
- ✅ Три варианта отображения: `error`, `warning`, `info`
- ✅ Автоматическое скрытие через заданное время (`autoDismiss`)
- ✅ Кнопка "Повторить" для повторной попытки запроса
- ✅ Кнопка закрытия
- ✅ Анимация появления
- ✅ Адаптивные цвета для разных типов ошибок

**Использование:**
```tsx
<ErrorDisplay
  error={error}
  onDismiss={clearError}
  onRetry={loadData}
  showRetry={true}
  variant="error"
  autoDismiss={5} // Автоматически скрыть через 5 секунд
/>
```

### 2. Хук useErrorHandler

Универсальный хук для обработки ошибок на всех страницах:

**Функции:**
- ✅ Автоматическое преобразование ошибок в читаемые сообщения
- ✅ Упрощенный API для работы с ошибками
- ✅ Интеграция с `errorHandler.ts` для парсинга API ошибок

**Использование:**
```tsx
const { error, handleError, clearError } = useErrorHandler();

try {
  await api.call();
} catch (err) {
  handleError(err); // Автоматически преобразует ошибку
}
```

### 3. Утилита errorHandler.ts

Централизованная обработка ошибок API:

**Функции:**
- ✅ Парсинг различных типов ошибок
- ✅ Пользовательские сообщения для HTTP статусов:
  - 401: "Необходима авторизация"
  - 403: "Нет прав для выполнения действия"
  - 404: "Ресурс не найден"
  - 500: "Ошибка сервера"
  - 503: "Сервис недоступен"
- ✅ Специальная обработка сетевых ошибок
- ✅ Извлечение деталей из ответа API

### 4. Улучшенные API клиенты

Оба API клиента (`lawyer-notary.ts` и `wills.ts`) теперь:
- ✅ Правильно обрабатывают HTTP ошибки
- ✅ Сохраняют статус код и код ошибки
- ✅ Бросают Error с дополнительной информацией

### 5. Интеграция на всех страницах

Обработка ошибок добавлена на всех страницах:

- ✅ `/dashboard` - с кнопкой retry
- ✅ `/lawyer-notary` - с кнопкой retry
- ✅ `/lawyer-notary/create` - при создании профиля
- ✅ `/lawyer-notary/[id]` - при загрузке и действиях
- ✅ `/lawyer-notary/[id]/edit` - при редактировании
- ✅ `/lawyer-notary/statistics` - при загрузке статистики
- ✅ `/wills/appointments` - с кнопкой retry
- ✅ `/wills/data/[id]` - при загрузке данных
- ✅ `/wills/executions` - с кнопкой retry

## Примеры использования

### Базовое использование

```tsx
const { error, handleError, clearError } = useErrorHandler();

const loadData = async () => {
  try {
    clearError();
    const data = await api.getAll();
    setData(data);
  } catch (err) {
    handleError(err);
  }
};

return (
  <>
    {error && (
      <ErrorDisplay
        error={error}
        onDismiss={clearError}
        onRetry={loadData}
        showRetry={true}
      />
    )}
    {/* Остальной контент */}
  </>
);
```

### С автоматическим скрытием

```tsx
<ErrorDisplay
  error={error}
  onDismiss={clearError}
  autoDismiss={3} // Скрыть через 3 секунды
/>
```

### С предупреждением

```tsx
<ErrorDisplay
  error={warning}
  variant="warning"
  onDismiss={clearWarning}
/>
```

## Преимущества

1. **Единообразие** - все ошибки отображаются одинаково
2. **Удобство** - кнопка retry для быстрого повторного запроса
3. **Информативность** - понятные сообщения для пользователя
4. **Гибкость** - разные варианты отображения
5. **Автоматизация** - автоматическое скрытие и парсинг ошибок



