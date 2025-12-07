# Проверка Keycloak - 2025-12-03

**Дата:** 2025-12-03
**Статус:** ✅ **Keycloak запущен, требуется настройка**

---

## ✅ Результаты проверки

### Статус контейнера

- **Контейнер:** `mm-keycloak`
- **Статус:** ✅ Запущен (Up 4 hours)
- **Порт:** `0.0.0.0:8080->8080/tcp`
- **Образ:** `quay.io/keycloak/keycloak:24.0`

### Доступность

- ✅ Keycloak доступен на `http://localhost:8080`
- ✅ Master realm доступен
- ⚠️ Realm `memento-mori` может не быть настроен

---

## ⚠️ Обнаруженные проблемы

### 1. HTTPS Required для Admin API

**Проблема:**

- Keycloak требует HTTPS для получения admin токена через REST API
- Ошибка: `"HTTPS required"` при попытке получить токен

**Причина:**

- Настройки безопасности Keycloak по умолчанию требуют HTTPS для admin операций

**Решение:**

1. Использовать Admin Console через браузер (http://localhost:8080)
2. Или использовать `kcadm.sh` внутри контейнера
3. Или настроить Keycloak для разрешения HTTP в development

### 2. Realm memento-mori

**Статус:** ⚠️ Требует проверки

- Realm может не существовать
- Требуется создание через Admin Console или скрипт

---

## 🔧 Рекомендации по настройке

### Вариант 1: Через Admin Console (Рекомендуется)

1. **Открыть Admin Console:**
   - URL: http://localhost:8080
   - Логин: `admin`
   - Пароль: `admin`

2. **Создать Realm:**
   - Выбрать dropdown "master" → "Create Realm"
   - **Realm name:** `memento-mori`
   - Нажать "Create"

3. **Создать Client:**
   - Перейти в **Clients** → "Create client"
   - **Client ID:** `memento-mori-api`
   - **Client type:** OpenID Connect
   - **Client authentication:** ON
   - **Authorization:** OFF
   - **Authentication flow:**
     - ✅ Standard flow
     - ✅ Direct access grants
   - Сохранить

4. **Получить Client Secret:**
   - Перейти в **Credentials** tab
   - Скопировать **Client secret**
   - Добавить в `apps/server/.env`:
     ```env
     KEYCLOAK_CLIENT_SECRET=<your-secret-here>
     ```

5. **Создать Roles:**
   - Перейти в **Realm roles** → "Create role"
   - Создать роли:
     - `client`
     - `vendor`
     - `lawyer_notary`
     - `admin`

6. **Создать Test Users:**
   - Перейти в **Users** → "Create user"
   - Создать пользователей из `TEST_CREDENTIALS.md`
   - Назначить роли каждому пользователю

### Вариант 2: Через kcadm.sh (внутри контейнера)

```bash
# Войти в контейнер
docker compose exec keycloak bash

# Настроить credentials
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin

# Создать realm
/opt/keycloak/bin/kcadm.sh create realms \
  -s realm=memento-mori \
  -s enabled=true

# Создать client
/opt/keycloak/bin/kcadm.sh create clients \
  -r memento-mori \
  -s clientId=memento-mori-api \
  -s enabled=true \
  -s clientAuthenticatorType=client-secret \
  -s directAccessGrantsEnabled=true

# И т.д.
```

### Вариант 3: Использовать скрипт setup-keycloak.js (после настройки HTTPS)

Скрипт `scripts/setup-keycloak.js` автоматизирует настройку, но требует HTTPS для admin API.

---

## 📋 Тестовые учетные данные

После настройки можно использовать:

| Email                | Password    | Role          |
| -------------------- | ----------- | ------------- |
| admin@mementomori.de | password123 | ADMIN         |
| client1@test.com     | password123 | CLIENT        |
| vendor1@test.com     | password123 | VENDOR        |
| lawyer1@test.com     | password123 | LAWYER_NOTARY |

Полный список: `docs/TEST_CREDENTIALS.md`

---

## ✅ Следующие шаги

1. ✅ Keycloak запущен и доступен
2. ⏳ Настроить realm `memento-mori` (через Admin Console)
3. ⏳ Создать client `memento-mori-api`
4. ⏳ Получить `KEYCLOAK_CLIENT_SECRET`
5. ⏳ Добавить secret в `apps/server/.env`
6. ⏳ Создать тестовых пользователей
7. ⏳ Протестировать получение токенов через `POST /api/auth/login`

---

## 🔗 Полезные ссылки

- **Keycloak Admin Console:** http://localhost:8080
- **Keycloak Documentation:** https://www.keycloak.org/docs/
- **Test Credentials:** `docs/TEST_CREDENTIALS.md`
- **Setup Script:** `scripts/setup-keycloak.js`

---

**Последнее обновление:** 2025-12-03
